from app.pronunciation.engines.azure import AzurePronunciationAssessmentEngine
from app.pronunciation.errors import EngineConfigurationError


def get_engine(settings):
    engine_name = settings.pa_engine.lower()
    if engine_name == "azure":
        return AzurePronunciationAssessmentEngine(settings)

    raise EngineConfigurationError(f"unsupported PA_ENGINE: {settings.pa_engine}")
