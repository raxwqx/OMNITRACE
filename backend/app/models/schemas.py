from pydantic import BaseModel, Field, field_validator
from typing import Literal

class IdentitySearchRequest(BaseModel):
    username: str = Field(min_length=1, max_length=64)
    platforms: list[str] | None = Field(default=None, max_length=40)

    @field_validator("username")
    @classmethod
    def clean_username(cls, value: str) -> str:
        value = value.strip().lstrip("@")
        if not value or len(value) > 64:
            raise ValueError("Username must be between 1 and 64 characters.")
        if not all(ch.isalnum() or ch in "._-" for ch in value):
            raise ValueError("Use only letters, numbers, dot, underscore, and hyphen.")
        return value

class CaseCreate(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    notes: str = Field(default="", max_length=5000)

    @field_validator("title")
    @classmethod
    def clean_title(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Title cannot be blank.")
        return value

class CaseRecord(BaseModel):
    id: int
    title: str
    notes: str
    created_at: str
