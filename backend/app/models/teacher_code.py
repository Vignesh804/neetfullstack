from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.db.base import Base


class TeacherAccessCode(Base):
    __tablename__ = "teacher_access_codes"

    id:         Mapped[int]      = mapped_column(Integer, primary_key=True, autoincrement=True)
    code:       Mapped[str]      = mapped_column(String(20), unique=True, index=True, nullable=False)
    is_active:  Mapped[bool]     = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
