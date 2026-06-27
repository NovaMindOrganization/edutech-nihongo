from http import HTTPStatus


class AppError(Exception):
    def __init__(self, message: str, status_code: int, error_code: str) -> None:
        self.message = message
        self.status_code = status_code
        self.error_code = error_code
        super().__init__(message)


class InvalidRequestError(AppError):
    def __init__(self, message: str) -> None:
        super().__init__(message, HTTPStatus.BAD_REQUEST, "invalid_request")


class InvalidAudioError(AppError):
    def __init__(self, message: str) -> None:
        super().__init__(message, HTTPStatus.BAD_REQUEST, "invalid_audio")


class AudioPayloadTooLargeError(AppError):
    def __init__(self, message: str) -> None:
        super().__init__(message, HTTPStatus.REQUEST_ENTITY_TOO_LARGE, "payload_too_large")


class ServiceUnavailableError(AppError):
    def __init__(self, message: str, error_code: str = "service_unavailable") -> None:
        super().__init__(message, HTTPStatus.SERVICE_UNAVAILABLE, error_code)


class EngineConfigurationError(ServiceUnavailableError):
    def __init__(self, message: str) -> None:
        super().__init__(message, "engine_configuration_error")


class EngineExecutionError(ServiceUnavailableError):
    def __init__(self, message: str) -> None:
        super().__init__(message, "engine_execution_error")


class AudioProcessingUnavailableError(ServiceUnavailableError):
    def __init__(self, message: str) -> None:
        super().__init__(message, "audio_processing_unavailable")
