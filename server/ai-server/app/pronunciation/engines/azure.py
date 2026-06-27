import json
from pathlib import Path
from typing import Any

from app.core.config import Settings
from app.pronunciation.engines.base import EngineResult, WordScore
from app.pronunciation.errors import EngineConfigurationError, EngineExecutionError, InvalidRequestError


AZURE_LANGUAGE_MAP = {
    "ja": "ja-JP",
    "ja-jp": "ja-JP",
}


class AzurePronunciationAssessmentEngine:
    name = "azure"

    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        if not settings.azure_speech_key or not settings.azure_speech_region:
            raise EngineConfigurationError(
                "AZURE_SPEECH_KEY and AZURE_SPEECH_REGION are required for Azure PA"
            )

    def assess(self, wav_path: Path, reference_text: str, language: str, pass_threshold: float) -> EngineResult:
        try:
            import azure.cognitiveservices.speech as speechsdk
        except ImportError as exc:
            raise EngineConfigurationError("azure-cognitiveservices-speech is not installed") from exc

        locale = normalize_language(language)
        speech_config = speechsdk.SpeechConfig(
            subscription=self._settings.azure_speech_key,
            region=self._settings.azure_speech_region,
        )
        speech_config.speech_recognition_language = locale

        audio_config = speechsdk.audio.AudioConfig(filename=str(wav_path))
        recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config, audio_config=audio_config)
        assessment_config = speechsdk.PronunciationAssessmentConfig(
            reference_text=reference_text,
            grading_system=speechsdk.PronunciationAssessmentGradingSystem.HundredMark,
            granularity=speechsdk.PronunciationAssessmentGranularity.Phoneme,
            enable_miscue=True,
        )
        assessment_config.apply_to(recognizer)

        result = recognizer.recognize_once_async().get()
        if result.reason == speechsdk.ResultReason.RecognizedSpeech:
            json_payload = result.properties.get(speechsdk.PropertyId.SpeechServiceResponse_JsonResult)
            return _parse_azure_result(json_payload, result.text, pass_threshold)

        if result.reason == speechsdk.ResultReason.NoMatch:
            return EngineResult(
                overall_score=0,
                transcript=None,
                feedback_vi="Không nhận diện được phát âm. Hãy đọc rõ hơn và giữ micro gần miệng hơn.",
                raw_scores={"accuracy": 0, "fluency": None, "completeness": 0},
            )

        if result.reason == speechsdk.ResultReason.Canceled:
            cancellation = speechsdk.CancellationDetails(result)
            raise EngineExecutionError(f"Azure PA canceled: {cancellation.reason}; {cancellation.error_details}")

        raise EngineExecutionError(f"Azure PA returned unexpected reason: {result.reason}")


def normalize_language(language: str) -> str:
    normalized = language.strip().lower()
    locale = AZURE_LANGUAGE_MAP.get(normalized)
    if locale is None:
        raise InvalidRequestError("language must be 'ja' or 'ja-JP'")
    return locale


def _parse_azure_result(json_payload: str | None, fallback_text: str | None, pass_threshold: float) -> EngineResult:
    if not json_payload:
        raise EngineExecutionError("Azure PA response did not include JSON details")

    try:
        payload = json.loads(json_payload)
    except json.JSONDecodeError as exc:
        raise EngineExecutionError("Azure PA response JSON is invalid") from exc

    best = _first_nbest(payload)
    assessment = best.get("PronunciationAssessment", {})
    words = [_parse_word_score(word) for word in best.get("Words", [])]

    overall_score = _score(assessment, "PronScore")
    if overall_score is None:
        overall_score = _score(assessment, "AccuracyScore") or 0

    transcript = best.get("Display") or payload.get("DisplayText") or fallback_text
    raw_scores = {
        "accuracy": _score(assessment, "AccuracyScore"),
        "fluency": _score(assessment, "FluencyScore"),
        "completeness": _score(assessment, "CompletenessScore"),
        "prosody": _score(assessment, "ProsodyScore"),
    }

    return EngineResult(
        overall_score=round(float(overall_score), 2),
        transcript=transcript,
        feedback_vi=_build_feedback_vi(float(overall_score), pass_threshold, raw_scores, words),
        raw_scores=raw_scores,
        words=words,
    )


def _first_nbest(payload: dict[str, Any]) -> dict[str, Any]:
    nbest = payload.get("NBest")
    if isinstance(nbest, list) and nbest:
        return nbest[0]
    return payload


def _score(source: dict[str, Any], key: str) -> float | None:
    value = source.get(key)
    if value is None:
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _parse_word_score(word_payload: dict[str, Any]) -> WordScore:
    assessment = word_payload.get("PronunciationAssessment", {})
    return WordScore(
        word=str(word_payload.get("Word", "")),
        accuracy_score=_score(assessment, "AccuracyScore"),
        error_type=assessment.get("ErrorType"),
    )


def _build_feedback_vi(
    overall_score: float,
    pass_threshold: float,
    raw_scores: dict[str, float | None],
    words: list[WordScore],
) -> str:
    if overall_score >= pass_threshold:
        if raw_scores.get("accuracy") is not None and raw_scores["accuracy"] < 80:
            return "Đạt ngưỡng. Phát âm đã hiểu được, nhưng nên luyện lại các âm có điểm thấp để rõ hơn."
        return "Phát âm tốt. Tiếp tục giữ tốc độ đọc ổn định và phát âm rõ từng âm."

    feedback: list[str] = []
    accuracy = raw_scores.get("accuracy")
    completeness = raw_scores.get("completeness")
    fluency = raw_scores.get("fluency")

    if accuracy is not None and accuracy < 65:
        feedback.append("Âm đọc chưa khớp mẫu, hãy nghe lại câu chuẩn rồi đọc chậm hơn.")
    if completeness is not None and completeness < 70:
        feedback.append("Có thể bạn đã bỏ sót hoặc nuốt một phần âm trong câu.")
    if fluency is not None and fluency < 70:
        feedback.append("Nhịp đọc còn ngắt quãng, hãy đọc liền mạch hơn.")

    weakest_word = _weakest_word(words)
    if weakest_word:
        feedback.append(f"Chú ý phát âm phần '{weakest_word}'.")

    if not feedback:
        feedback.append("Phát âm chưa đạt ngưỡng, hãy đọc rõ hơn và thử lại trong môi trường ít tiếng ồn.")

    return " ".join(feedback[:3])


def _weakest_word(words: list[WordScore]) -> str | None:
    scored_words = [word for word in words if word.word and word.accuracy_score is not None]
    if not scored_words:
        return None
    weakest = min(scored_words, key=lambda word: word.accuracy_score or 0)
    return weakest.word if (weakest.accuracy_score or 100) < 70 else None
