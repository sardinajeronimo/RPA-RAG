
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
- 💬 Chat en tiempo real con mensajes lado a lado
- 📋 Copiar mensajes al portapapeles
- 🔄 Indicador de carga durante procesamiento
- 📱 Diseño responsivo

### Backend
- ⚡ FastAPI para API REST rápida
- 🧠 Integración con Pinecone para búsqueda vectorial
- 🔍 Búsqueda semántica en documentos
- 📊 Información de fuentes y relevancia

-> con correr npm run dev el proyecto ya corre


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
