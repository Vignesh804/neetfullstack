from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field
from pydantic.alias_generators import to_camel
from pydantic import AliasChoices, ConfigDict

from app.models.enums import UserRole


class UserCreate(BaseModel):
  model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)

  username: str = Field(validation_alias=AliasChoices("username", "name"))
  email: EmailStr
  password: str = Field(min_length=6)
  device_id: str | None = Field(default=None, max_length=80)
  role: UserRole = UserRole.student


class UserLogin(BaseModel):
  email: EmailStr
  password: str
  role: UserRole | None = None
  device_id: str | None = Field(default=None, max_length=80)
  teacher_code: str | None = Field(default=None, max_length=20)


class UserPublic(BaseModel):
  model_config = ConfigDict(from_attributes=True)

  id: uuid.UUID
  username: str
  email: EmailStr
  role: UserRole
  is_paid: bool = False
  created_at: datetime
