from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', extra='ignore')

    app_name: str = 'AI Service'
    database_url: str = 'sqlite:///./local.db'

    gemini_api_key: str | None = None
    google_api_key: str | None = None
    gemini_model: str = 'gemini-2.5-flash'
    openai_api_key: str | None = None
    llm_model: str = 'gpt-4o-mini'
    llm_system_prompt: str | None = None

    # STT (Whisper local + Gemini fallback)
    whisper_model: str = 'base'
    whisper_device: str = 'cpu'
    whisper_compute_type: str = 'int8'
    stt_default_language: str = 'ja'
    stt_gemini_fallback: bool = True
    stt_vad_filter: bool = True
    stt_beam_size: int = 5
    stt_temperature: float = 0.0
    stt_sample_rate: int = 16000
    stt_min_audio_bytes: int = 500
    stt_max_duration_sec: int = 120

    # TTS (Edge)
    edge_tts_voice: str = 'ja-JP-NanamiNeural'

    ocr_engine: str = 'paddleocr'
    ocr_use_gpu: bool = True
    ocr_min_confidence: float = 0.5
    google_vision_api_key: str | None = None

    @property
    def gemini_key(self) -> str | None:
        return self.gemini_api_key or self.google_api_key


settings = Settings()
