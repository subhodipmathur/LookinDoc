from typing import Any, List, Tuple, Type, Union
from pydantic.fields import FieldInfo
from pydantic_settings import (
    BaseSettings,
    EnvSettingsSource,
    PydanticBaseSettingsSource,
    SettingsConfigDict,
)
import json


class FlexibleEnvSource(EnvSettingsSource):
    """
    Custom env source that makes BACKEND_CORS_ORIGINS accept three formats:
    - Empty / missing  → uses the default value defined on the model
    - Comma-separated  → "https://foo.vercel.app,http://localhost:5173"
    - JSON array       → '["https://foo.vercel.app","http://localhost:5173"]'
    """

    def prepare_field_value(
        self, field_name: str, field: FieldInfo, value: Any, value_is_complex: bool
    ) -> Any:
        if field_name == "BACKEND_CORS_ORIGINS" and isinstance(value, str):
            value = value.strip()
            if not value:
                # Empty string → use model default
                return None
            if value.startswith("["):
                # JSON array → parse and return a real Python list
                try:
                    parsed = json.loads(value)
                    if isinstance(parsed, list):
                        return [str(u).strip().rstrip("/") for u in parsed if str(u).strip()]
                except json.JSONDecodeError:
                    pass
            # Comma-separated → split and return a real Python list
            return [u.strip().rstrip("/") for u in value.split(",") if u.strip()]
        return super().prepare_field_value(field_name, field, value, value_is_complex)


class Settings(BaseSettings):
    PROJECT_NAME: str = "LookinDoc"
    API_V1_STR: str = "/api"
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_KEY: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    @classmethod
    def settings_customise_sources(
        cls,
        settings_cls: Type[BaseSettings],
        init_settings: PydanticBaseSettingsSource,
        env_settings: PydanticBaseSettingsSource,
        dotenv_settings: PydanticBaseSettingsSource,
        **kwargs,  # absorbs 'secrets_settings' (<v2.4) or 'file_secret_settings' (>=v2.4)
    ) -> Tuple[PydanticBaseSettingsSource, ...]:
        return (
            init_settings,
            FlexibleEnvSource(settings_cls),  # replaces default env_settings
            dotenv_settings,
        )


settings = Settings()
