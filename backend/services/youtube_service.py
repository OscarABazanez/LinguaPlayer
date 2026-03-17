import tempfile
import subprocess
from pathlib import Path


async def extract_audio(url: str) -> Path:
    """Extract audio from a YouTube URL using yt-dlp."""
    tmp_dir = tempfile.mkdtemp()
    output_path = Path(tmp_dir) / "audio.wav"

    process = subprocess.run(
        [
            "yt-dlp",
            "-x",
            "--audio-format", "wav",
            "--audio-quality", "0",
            "-o", str(output_path.with_suffix(".%(ext)s")),
            url,
        ],
        capture_output=True,
        text=True,
        timeout=300,
    )

    if process.returncode != 0:
        raise RuntimeError(f"yt-dlp failed: {process.stderr}")

    # yt-dlp may produce a file with different extension before converting
    wav_files = list(Path(tmp_dir).glob("audio.*"))
    if not wav_files:
        raise RuntimeError("No audio file produced")

    return wav_files[0]
