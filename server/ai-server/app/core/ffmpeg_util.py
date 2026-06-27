import os
import shutil
from pathlib import Path


def _imageio_ffmpeg_binary() -> str | None:
    try:
        import imageio_ffmpeg

        bundled = imageio_ffmpeg.get_ffmpeg_exe()
        if bundled and Path(bundled).is_file():
            return bundled
    except Exception:
        pass
    return None


def resolve_ffmpeg_binary() -> str | None:
    """Find a working ffmpeg: FFMPEG_PATH → imageio bundle → PATH → conda."""
    env_path = os.environ.get("FFMPEG_PATH", "").strip().strip('"')
    if env_path:
        candidate = Path(env_path)
        if candidate.is_file():
            return str(candidate)

    bundled = _imageio_ffmpeg_binary()
    if bundled:
        return bundled

    found = shutil.which("ffmpeg")
    if found:
        return found

    conda_prefix = os.environ.get("CONDA_PREFIX", "").strip()
    if conda_prefix:
        bin_dir = Path(conda_prefix) / "Library" / "bin"
        for name in ("ffmpeg.exe", "ffmpeg"):
            candidate = bin_dir / name
            if candidate.is_file():
                return str(candidate)

    return None
