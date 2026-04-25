from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables.

    Attributes:
        database_url (str): Async PostgreSQL connection string.
        redis_url (str): Redis connection string.
        camara_api_base_url (str): Base URL for the Câmara API.
        transparencia_api_key (str): Portal da Transparência API key.
        app_env (str): Application environment — defaults to 'production' for safety.
        app_debug (bool): Enable debug mode. Must never be true in production.
        cors_origins (list[str]): Allowed CORS origins.
    """

    database_url: str
    redis_url: str
    camara_api_base_url: str = "https://dadosabertos.camara.leg.br/api/v2"
    transparencia_api_key: str = ""

    # Default to production so a missing .env doesn't accidentally open debug mode.
    app_env: str = "production"
    app_debug: bool = False

    cors_origins: list[str] = ["http://localhost:3000"]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: object) -> list[str]:
        """Accept a plain comma-separated string or a JSON array.

        Railway doesn't handle JSON arrays in env vars well, so we also
        support a simple comma-separated format:
            CORS_ORIGINS=https://foo.vercel.app,https://bar.com

        Args:
            v (object): Raw value from the environment.

        Returns:
            list[str]: Parsed list of allowed origins.
        """
        if isinstance(v, list):
            return v
        if isinstance(v, str):
            v = v.strip()
            if v.startswith("["):
                import json

                return json.loads(v)
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v  # type: ignore[return-value]

    @field_validator("database_url")
    @classmethod
    def ensure_asyncpg_scheme(cls, v: str) -> str:
        """Normalise the DATABASE_URL to use the asyncpg driver.

        Railway and other platforms provide a plain 'postgresql://' or
        'postgres://' URL. SQLAlchemy needs 'postgresql+asyncpg://' for
        the async engine, so we rewrite the scheme on load.

        Args:
            v (str): Raw DATABASE_URL value.

        Returns:
            str: URL with the correct asyncpg scheme.
        """
        if v.startswith("postgres://"):
            return v.replace("postgres://", "postgresql+asyncpg://", 1)
        if v.startswith("postgresql://"):
            return v.replace("postgresql://", "postgresql+asyncpg://", 1)
        return v


settings = Settings()
