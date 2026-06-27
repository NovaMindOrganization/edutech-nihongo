from dataclasses import dataclass, field
from pathlib import Path
from typing import Protocol


@dataclass(frozen=True)
class WordScore:
    word: str
    accuracy_score: float | None = None
    error_type: str | None = None


@dataclass(frozen=True)
class EngineResult:
    overall_score: float
    transcript: str | None
    feedback_vi: str
    raw_scores: dict[str, float | None] = field(default_factory=dict)
    words: list[WordScore] = field(default_factory=list)


class PronunciationAssessmentEngine(Protocol):
    name: str

    def assess(self, wav_path: Path, reference_text: str, language: str, pass_threshold: float) -> EngineResult:
        ...
