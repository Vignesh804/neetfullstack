from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import REFRESH_TOKEN_TYPE, create_access_token, create_refresh_token, decode_token
from app.db.database import get_async_session
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.token import AccessTokenResponse, RefreshRequest, TokenResponse
from app.schemas.user import UserCreate, UserLogin, UserPublic
from app.services.auth_service import authenticate, register_student

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(data: UserCreate, session: AsyncSession = Depends(get_async_session)):
  user = await register_student(session, data)
  if data.device_id:
    user.device_id = data.device_id
    await session.commit()
    await session.refresh(user)
  access_token = create_access_token(subject=str(user.id), role=user.role.value, device_id=user.device_id)
  refresh_token = create_refresh_token(subject=str(user.id), role=user.role.value, device_id=user.device_id)
  return TokenResponse(access_token=access_token, refresh_token=refresh_token, user=user)


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin, session: AsyncSession = Depends(get_async_session)):
  user = await authenticate(
    session,
    email=str(data.email),
    password=data.password,
    role=data.role,
    teacher_code=data.teacher_code,
  )
  if data.device_id:
    user.device_id = data.device_id
    await session.commit()
    await session.refresh(user)
  access_token = create_access_token(subject=str(user.id), role=user.role.value, device_id=user.device_id)
  refresh_token = create_refresh_token(subject=str(user.id), role=user.role.value, device_id=user.device_id)
  return TokenResponse(access_token=access_token, refresh_token=refresh_token, user=user)


@router.post("/refresh", response_model=AccessTokenResponse)
async def refresh(data: RefreshRequest, session: AsyncSession = Depends(get_async_session)):
  try:
    payload = decode_token(data.refresh_token)
  except ValueError:
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

  if payload.token_type != REFRESH_TOKEN_TYPE:
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token type")

  try:
    user_id = uuid.UUID(payload.sub)
  except ValueError:
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token subject")

  user = await session.get(User, user_id)
  if not user:
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

  # Enforce single-device sessions (portfolio-level): if the user's active device_id differs,
  # reject refresh (old sessions get logged out when a new device logs in).
  if user.device_id and payload.device_id and user.device_id != payload.device_id:
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired")
  if data.device_id and user.device_id and data.device_id != user.device_id:
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired")
  if data.device_id and payload.device_id and data.device_id != payload.device_id:
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired")

  access_token = create_access_token(subject=str(user.id), role=user.role.value, device_id=user.device_id)
  return AccessTokenResponse(access_token=access_token)


@router.get("/me", response_model=UserPublic)
async def me(user: User = Depends(get_current_user)):
  return user
