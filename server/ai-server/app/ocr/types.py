from dataclasses import dataclass


@dataclass(frozen=True)
class OcrMeta:
    engine: str
    gpu: bool
    lang: str
    confidence_avg: float | None
    line_count: int
    processing_ms: int
