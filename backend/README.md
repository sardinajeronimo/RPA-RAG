# Backend RAG - IGV

Backend FastAPI para sistema RAG conectado a Pinecone Assistant API.

## Características

- ⚡ **FastAPI** - API REST moderna y rápida
- 🧠 **Pinecone Assistant** - Sistema RAG simplificado sin necesidad de OpenAI manual
- 📤 **Upload de archivos** - Sube PDFs, markdown, Word, TXT
- 🔄 **Multi-file upload** - Procesamiento de múltiples archivos en paralelo
- 💬 **Chat inteligente** - Conversaciones con contexto de documentos

## Instalación

```bash
# Crear entorno virtual
python3 -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt
```

## Configuración

1. Copiar `.env.example` a `.env`:
```bash
cp .env.example .env
```

2. Editar `.env` con tus credenciales:
```env
PINECONE_API_KEY=tu-pinecone-api-key
PINECONE_ASSISTANT_NAME=rparag
```

### Crear el Assistant en Pinecone

1. Ve a [Pinecone Console](https://app.pinecone.io/)
2. Crea un nuevo Assistant con el nombre `rparag` (o el que prefieras)
3. Copia el API key
4. Pégalo en el archivo `.env`

## Ejecución

```bash
# Activar entorno virtual
source venv/bin/activate

# Iniciar servidor
python main.py
```

El servidor estará disponible en: `http://localhost:8000`

## Endpoints

### `GET /`
Información del API

**Response:**
```json
{
  "message": "IGV RAG API - Online",
  "status": "ok",
  "assistant": "rparag"
}
```

### `POST /query`
Realiza una consulta al sistema RAG

**Request:**
```json
{
  "question": "¿Qué comandos tiene IBM RPA para archivos?",
  "session_id": "session-123",
  "stream": false
}
```

**Response:**
```json
{
  "answer": "IBM RPA tiene varios comandos para trabajar con archivos..."
}
```

### `POST /upload`
Sube un archivo al Pinecone Assistant

**Request:** `multipart/form-data`
- `file`: Archivo a subir (PDF, MD, TXT, DOCX)

**Response:**
```json
{
  "status": "success",
  "filename": "documento.pdf",
  "message": "Archivo subido y procesado correctamente",
  "response": {...}
}
```

### `POST /upload-multiple`
Sube múltiples archivos al Pinecone Assistant

**Request:** `multipart/form-data`
- `files`: Array de archivos

**Response:**
```json
{
  "total": 10,
  "successful": 9,
  "failed": 1,
  "results": [...],
  "errors": [...]
}
```

### `GET /health`
Verifica el estado del servicio

**Response:**
```json
{
  "status": "healthy",
  "pinecone": "connected",
  "assistant": "rparag"
}
```

## Archivos soportados

- `.txt` - Archivos de texto
- `.pdf` - Documentos PDF
- `.md`, `.markdown` - Archivos Markdown
- `.doc`, `.docx` - Documentos Word

## Ejemplo: Subir documentos IBM RPA

Si tienes una carpeta con documentación de IBM RPA en markdown:

```bash
# Usando curl
cd /path/to/ibm_rpa_docs

# Subir un archivo
curl -X POST http://localhost:8000/upload \
  -F "file=@0038_Commands.md"

# O usar el frontend para subir múltiples archivos
```

## Testing

```bash
# Health check
curl http://localhost:8000/health

# Query test
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{
    "question": "¿Qué es IBM RPA?",
    "session_id": "test-123"
  }'
```

## Troubleshooting

### Error: "Assistant no configurado"
- Verifica que `PINECONE_API_KEY` esté en `.env`
- Confirma que el assistant `rparag` existe en Pinecone Console

### Error: "Tipo de archivo no permitido"
- Solo se aceptan: `.txt, .pdf, .md, .markdown, .doc, .docx`
- Verifica la extensión del archivo

### Error de conexión
- Asegúrate de que el servidor esté corriendo: `python main.py`
- Verifica que el puerto 8000 no esté en uso

## Dependencias

```
fastapi==0.109.0
uvicorn[standard]==0.27.0
pinecone[assistant]==5.4.2
python-dotenv==1.0.0
pydantic==2.6.0
python-multipart==0.0.9
```

## Ventajas de Pinecone Assistant vs implementación manual

✅ **Más simple** - No necesitas gestionar embeddings manualmente
✅ **Sin OpenAI separado** - Pinecone maneja todo internamente
✅ **Escalable** - Automáticamente optimizado
✅ **Menos código** - Menos mantenimiento
✅ **Built-in chunking** - Chunking automático de documentos

## Licencia

Uso interno IGV
