from __future__ import annotations

from fastapi import status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import AppError
from app.core.security import get_password_hash, verify_password
from app.models.enums import UserRole
from app.models.teacher_code import TeacherAccessCode
from app.models.user import User
from app.schemas.user import UserCreate


async def get_user_by_email(session: AsyncSession, email: str) -> User | None:
  res = await session.execute(select(User).where(User.email == email))
  return res.scalar_one_or_none()


async def validate_teacher_code(session: AsyncSession, code: str) -> bool:
  """Return True if the code exists and is active."""
  res = await session.execute(
    select(TeacherAccessCode).where(
      TeacherAccessCode.code == code.strip(),
      TeacherAccessCode.is_active.is_(True),
    )
  )
  return res.scalar_one_or_none() is not None


async def create_user(
  session: AsyncSession,
  *,
  username: str,
  email: str,
  password: str,
  role: UserRole = UserRole.student,
) -> User:
  existing = await get_user_by_email(session, email)
  if existing:
    raise AppError("Email already registered", status_code=status.HTTP_409_CONFLICT, code="email_exists")

  user = User(
    username=username,
    email=email,
    hashed_password=get_password_hash(password),
    role=role,
  )
  session.add(user)
  await session.commit()
  await session.refresh(user)
  return user


async def register_student(session: AsyncSession, data: UserCreate) -> User:
  return await create_user(
    session,
    username=data.username,
    email=str(data.email).lower(),
    password=data.password,
    role=data.role if data.role in (UserRole.student, UserRole.teacher) else UserRole.student,
  )


async def authenticate(
  session: AsyncSession,
  *,
  email: str,
  password: str,
  role: UserRole | None = None,
  teacher_code: str | None = None,
) -> User:
  user = await get_user_by_email(session, str(email).lower())
  if not user:
    raise AppError("Invalid credentials", status_code=status.HTTP_401_UNAUTHORIZED, code="invalid_credentials")

  # Allow admin to log in regardless of requested role; otherwise enforce role match.
  if role and user.role != UserRole.admin and user.role != role:
    raise AppError("Invalid role for account", status_code=status.HTTP_403_FORBIDDEN, code="role_mismatch")

  if not verify_password(password, user.hashed_password):
    raise AppError("Invalid credentials", status_code=status.HTTP_401_UNAUTHORIZED, code="invalid_credentials")

  # Teacher login requires a valid access code
  if user.role == UserRole.teacher:
    if not teacher_code:
      raise AppError(
        "Teacher access code is required",
        status_code=status.HTTP_403_FORBIDDEN,
        code="teacher_code_required",
      )
    code_valid = await validate_teacher_code(session, teacher_code)
    if not code_valid:
      raise AppError(
        "Invalid teacher access code",
        status_code=status.HTTP_403_FORBIDDEN,
        code="invalid_teacher_code",
      )

  return user

