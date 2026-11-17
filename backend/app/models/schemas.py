from pydantic import BaseModel, Field, field_validator

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
        if not any(ch.isalnum() for ch in value):
            raise ValueError("Username must contain at least one letter or number.")
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

    @field_validator("notes")
    @classmethod
    def clean_notes(cls, value: str) -> str:
        return value.strip()

class CaseRecord(BaseModel):
    id: int
    title: str
    notes: str
    created_at: str

class IndicatorCreate(BaseModel):
    value: str = Field(min_length=1, max_length=2048)
    note: str = Field(default="", max_length=2000)
    case_id: int | None = Field(default=None, ge=1)

    @field_validator("value")
    @classmethod
    def clean_value(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Indicator cannot be blank.")
        return value

    @field_validator("note")
    @classmethod
    def clean_note(cls, value: str) -> str:
        return value.strip()
