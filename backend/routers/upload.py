import os
import uuid
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel

router = APIRouter()

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
RAW_DIR = os.path.join(UPLOAD_DIR, "raw")
PROCESSED_DIR = os.path.join(UPLOAD_DIR, "processed")

ALLOWED_EXTENSIONS = {".mp4", ".webm", ".mkv", ".avi"}
MAX_FILE_SIZE = 500 * 1024 * 1024  # 500MB


@router.post("/upload")
async def upload_video(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, f"Unsupported file type: {ext}")

    file_id = uuid.uuid4().hex
    safe_name = f"{file_id}{ext}"
    raw_path = os.path.join(RAW_DIR, safe_name)

    size = 0
    with open(raw_path, "wb") as f:
        while chunk := await file.read(1024 * 1024):
            size += len(chunk)
            if size > MAX_FILE_SIZE:
                f.close()
                os.remove(raw_path)
                raise HTTPException(413, "File too large (max 500MB)")
            f.write(chunk)

    return JSONResponse({
        "fileId": file_id,
        "fileName": file.filename,
        "storedName": safe_name,
        "size": size,
    })


class MarkProcessedRequest(BaseModel):
    stored_name: str


@router.post("/upload/mark-processed")
async def mark_processed(req: MarkProcessedRequest):
    raw_path = os.path.join(RAW_DIR, req.stored_name)
    if not os.path.exists(raw_path):
        raise HTTPException(404, "File not found in raw folder")

    processed_path = os.path.join(PROCESSED_DIR, req.stored_name)
    shutil.move(raw_path, processed_path)

    return {"status": "ok", "path": f"/uploads/{req.stored_name}"}


@router.get("/upload/files")
async def list_processed_files():
    files = []
    if os.path.exists(PROCESSED_DIR):
        for name in os.listdir(PROCESSED_DIR):
            if os.path.splitext(name)[1].lower() in ALLOWED_EXTENSIONS:
                size = os.path.getsize(os.path.join(PROCESSED_DIR, name))
                files.append({"name": name, "size": size})
    return {"files": files}
