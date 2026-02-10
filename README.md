# Asistente IGV - Sistema RAG

Sistema de chat inteligente con Retrieval-Augmented Generation (RAG) para IGV. Permite hacer preguntas sobre documentación técnica con respuestas generadas por IA.

## Arquitectura

```
rag chatbot frontend/
├── backend/              # Backend FastAPI + Pinecone + OpenAI
│   ├── main.py          # API principal
│   ├── requirements.txt # Dependencias Python
│   ├── .env.example     # Template de configuración
│   └── README.md        # Documentación del backend
│
├── src/                 # Frontend React + Vite
│   ├── App.jsx          # Componente principal de chat
│   ├── main.jsx         # Punto de entrada
│   └── index.css        # Estilos globales
│
└── package.json         # Dependencias Node.js
```

## Características

### Frontend
- 🎨 Interfaz limpia estilo ChatGPT/Claude
- 🏢 Diseño corporativo IGV con colores institucionales (RGB: 0, 62, 134)
- 💬 Chat en tiempo real con mensajes lado a lado
- 📋 Copiar mensajes al portapapeles
- 🔄 Indicador de carga durante procesamiento
- 📱 Diseño responsivo

### Backend
- ⚡ FastAPI para API REST rápida
- 🧠 Integración con Pinecone para búsqueda vectorial
- 🤖 OpenAI GPT-4 para generación de respuestas
- 🔍 Búsqueda semántica en documentos
- 📊 Información de fuentes y relevancia

## Instalación

### Backend

```bash
cd backend

# Crear entorno virtual
python3 -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus API keys
```

### Frontend

```bash
# Desde la raíz del proyecto
npm install
```

## Configuración

### Variables de entorno del Backend

Crear archivo `backend/.env` con:

```env
PINECONE_API_KEY=tu-pinecone-api-key
PINECONE_INDEX_NAME=rag-documents
OPENAI_API_KEY=tu-openai-api-key
```

## Ejecución

### 1. Iniciar el Backend

```bash
cd backend
source venv/bin/activate
python main.py
```

El backend estará disponible en: `http://localhost:8000`

### 2. Iniciar el Frontend

```bash
# En otra terminal, desde la raíz del proyecto
npm run dev
```

El frontend estará disponible en: `http://localhost:5173`

## Uso

1. Abre el navegador en `http://localhost:5173`
2. Verás la interfaz del Asistente IGV
3. Escribe tu pregunta sobre documentación técnica
4. El sistema buscará información relevante en Pinecone
5. GPT-4 generará una respuesta basada en el contexto encontrado

## API Endpoints

### `POST /query`
Realiza una consulta al sistema RAG.

**Request:**
```json
{
  "question": "¿Qué es Selenium?",
  "session_id": "session-123",
  "top_k": 5
}
```

**Response:**
```json
{
  "answer": "Selenium es un framework...",
  "sources": [
    {
      "id": "doc-1-chunk-5",
      "score": 0.89,
      "metadata": {...}
    }
  ]
}
```

### `GET /health`
Verifica el estado de los servicios.

## Tecnologías

### Frontend
- React 19
- Vite 7
- Tailwind CSS 3
- Lucide React (iconos)

### Backend
- FastAPI
- Pinecone (vector database)
- OpenAI (embeddings + GPT-4)
- Python 3.9+

## Desarrollo

### Estructura del Chat

El chat sigue el patrón de ChatGPT/Claude:
- Mensajes del usuario en la derecha con fondo blanco
- Respuestas del asistente en la izquierda
- Logo IGV arriba a la izquierda
- Colores corporativos: RGB(0, 62, 134)

### Personalización

Para cambiar el color corporativo, busca todas las ocurrencias de `rgb(0, 62, 134)` en `src/App.jsx`.

## Troubleshooting

### El backend no conecta con Pinecone
- Verifica que el archivo `.env` existe en `backend/`
- Confirma que las API keys son correctas
- Verifica que el nombre del índice existe en Pinecone

### El frontend no puede comunicarse con el backend
- Asegúrate de que el backend está corriendo en `http://localhost:8000`
- Verifica que no hay bloqueos de CORS
- Revisa la consola del navegador para errores

### Errores de OpenAI
- Verifica que tu API key de OpenAI es válida
- Confirma que tienes créditos disponibles
- Verifica que el modelo `gpt-4` está disponible en tu cuenta

## Licencia

Uso interno IGV
