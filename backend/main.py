from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pinecone import Pinecone
import os
from typing import List, Optional
import tempfile
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = FastAPI(title="IGV RAG API")

# CORS - permitir peticiones desde el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar el dominio exacto
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuración de Pinecone
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
ASSISTANT_NAME = os.getenv("PINECONE_ASSISTANT_NAME", "rparag")

# Inicializar Pinecone y Assistant
pc = Pinecone(api_key=PINECONE_API_KEY)
assistant = pc.assistant.Assistant(assistant_name=ASSISTANT_NAME)


class QueryRequest(BaseModel):
    question: str
    session_id: Optional[str] = None
    stream: bool = False


class QueryResponse(BaseModel):
    answer: str


@app.get("/")
async def root():
    return {
        "message": "IGV RAG API - Online",
        "status": "ok",
        "assistant": ASSISTANT_NAME
    }


@app.post("/query", response_model=QueryResponse)
async def query_rag(request: QueryRequest):
    """
    Endpoint principal para hacer consultas al sistema RAG usando Pinecone Assistant.
    Más simple y directo que la implementación manual.
    """
    try:
        # Crear mensaje como diccionario
        msg = {"role": "user", "content": request.question}

        # Si streaming está deshabilitado (por defecto)
        if not request.stream:
            response = assistant.chat(messages=[msg])
            answer = response.get("message", {}).get("content", "No se recibió respuesta.")
            return QueryResponse(answer=answer)

        # Streaming (futuro)
        else:
            # Por ahora, streaming no implementado en el frontend
            # chunks = assistant.chat(messages=[msg], stream=True)
            # Se puede implementar con Server-Sent Events (SSE) más adelante
            response = assistant.chat(messages=[msg])
            answer = response.get("message", {}).get("content", "No se recibió respuesta.")
            return QueryResponse(answer=answer)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error procesando consulta: {str(e)}"
        )


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    Endpoint para subir archivos al Pinecone Assistant.
    Acepta archivos de texto, PDF, markdown, etc.
    """
    try:
        # Validar tipo de archivo
        allowed_extensions = ['.txt', '.pdf', '.md', '.markdown', '.doc', '.docx']
        file_ext = os.path.splitext(file.filename)[1].lower()

        if file_ext not in allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"Tipo de archivo no permitido. Extensiones permitidas: {', '.join(allowed_extensions)}"
            )

        # Guardar temporalmente el archivo
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_path = temp_file.name

        try:
            # Subir a Pinecone Assistant
            response = assistant.upload_file(
                file_path=temp_path,
                timeout=None
            )

            return {
                "status": "success",
                "filename": file.filename,
                "message": "Archivo subido y procesado correctamente",
                "response": response
            }

        finally:
            # Limpiar archivo temporal
            if os.path.exists(temp_path):
                os.remove(temp_path)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al subir archivo: {str(e)}"
        )


@app.post("/upload-multiple")
async def upload_multiple_files(files: List[UploadFile] = File(...)):
    """
    Endpoint para subir múltiples archivos al Pinecone Assistant.
    """
    results = []
    errors = []

    for file in files:
        try:
            # Validar tipo de archivo
            allowed_extensions = ['.txt', '.pdf', '.md', '.markdown', '.doc', '.docx']
            file_ext = os.path.splitext(file.filename)[1].lower()

            if file_ext not in allowed_extensions:
                errors.append({
                    "filename": file.filename,
                    "error": f"Tipo de archivo no permitido: {file_ext}"
                })
                continue

            # Guardar temporalmente el archivo
            with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as temp_file:
                content = await file.read()
                temp_file.write(content)
                temp_path = temp_file.name

            try:
                # Subir a Pinecone Assistant
                response = assistant.upload_file(
                    file_path=temp_path,
                    timeout=None
                )

                results.append({
                    "status": "success",
                    "filename": file.filename
                })

            finally:
                # Limpiar archivo temporal
                if os.path.exists(temp_path):
                    os.remove(temp_path)

        except Exception as e:
            errors.append({
                "filename": file.filename,
                "error": str(e)
            })

    return {
        "total": len(files),
        "successful": len(results),
        "failed": len(errors),
        "results": results,
        "errors": errors
    }


@app.get("/health")
async def health_check():
    """Endpoint de health check para verificar estado de servicios"""
    try:
        # Verificar que el assistant está configurado
        if assistant:
            return {
                "status": "healthy",
                "pinecone": "connected",
                "assistant": ASSISTANT_NAME
            }
        else:
            return {
                "status": "degraded",
                "error": "Assistant no configurado"
            }
    except Exception as e:
        return {
            "status": "degraded",
            "error": str(e)
        }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
