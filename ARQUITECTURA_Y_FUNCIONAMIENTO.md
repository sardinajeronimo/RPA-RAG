# 🏗️ Arquitectura y Funcionamiento del Sistema

## ⚠️ Importante: NO es 100% Local

Este sistema **NO funciona completamente local**. Usa servicios en la nube:

- ✅ **Frontend**: Local (tu navegador)
- ✅ **Backend**: Local (tu computadora en puerto 8000)
- ❌ **Base de datos vectorial**: **Pinecone Cloud** (en internet)
- ❌ **IA/LLM**: **Pinecone Assistant** (usa modelos en la nube)

---

## 📊 Diagrama de Flujo Completo

```
┌─────────────────────────────────────────────────────────────────┐
│                         TU COMPUTADORA                           │
│                                                                   │
│  ┌─────────────────┐          ┌──────────────────┐             │
│  │   NAVEGADOR     │          │   BACKEND        │             │
│  │   (Frontend)    │◄────────►│   (FastAPI)      │             │
│  │  localhost:5173 │          │  localhost:8000  │             │
│  │                 │          │                  │             │
│  │  - Chat UI      │          │  - Recibe query  │             │
│  │  - Upload files │          │  - Sube archivos │             │
│  │  - Logo IGV     │          │  - Procesa PDFs  │             │
│  └─────────────────┘          └──────────────────┘             │
│                                        │                         │
└────────────────────────────────────────┼─────────────────────────┘
                                         │
                                         │ Internet
                                         ▼
                         ┌───────────────────────────┐
                         │   PINECONE CLOUD          │
                         │   (Servidor de Pinecone)  │
                         │                           │
                         │  ┌─────────────────────┐  │
                         │  │ ASSISTANT "rparag"  │  │
                         │  │                     │  │
                         │  │ • Vectores/embeddings│ │
                         │  │ • Documentos        │  │
                         │  │ • Modelo de IA      │  │
                         │  │ • Chunking          │  │
                         │  └─────────────────────┘  │
                         └───────────────────────────┘
```

---

## 🔄 Flujo de Datos: Subir Archivos

### 1. Usuario sube archivos desde el frontend

```
Usuario → Click "Subir Archivos" → Selecciona PDFs/MD
```

### 2. Frontend envía archivos al backend

```
Frontend (React)
  │
  └─► POST http://localhost:8000/upload-multiple
       └─► FormData con archivos
```

### 3. Backend procesa y envía a Pinecone

```python
Backend (FastAPI)
  │
  ├─► Recibe archivos
  ├─► Guarda temporalmente en /tmp/
  ├─► Lee contenido
  │
  └─► assistant.upload_file(file_path)
       │
       └─► Envía a Pinecone Cloud vía Internet
```

### 4. Pinecone procesa y almacena

```
Pinecone Cloud
  │
  ├─► Extrae texto del archivo
  ├─► Divide en chunks (pedazos pequeños)
  ├─► Genera embeddings (vectores)
  ├─► Almacena en base de datos vectorial
  │
  └─► ✅ Archivo listo para consultas
```

---

## 💬 Flujo de Datos: Hacer una Pregunta

### 1. Usuario escribe pregunta

```
Usuario → Escribe "¿Qué comandos tiene IBM RPA?"
       → Presiona Enter
```

### 2. Frontend envía al backend

```
Frontend (React)
  │
  └─► POST http://localhost:8000/query
       └─► { "question": "¿Qué comandos tiene IBM RPA?" }
```

### 3. Backend procesa la consulta

```python
Backend (FastAPI)
  │
  ├─► Recibe pregunta
  ├─► Crea objeto Message
  │
  └─► assistant.chat(messages=[msg])
       │
       └─► Envía a Pinecone Cloud vía Internet
```

### 4. Pinecone busca y genera respuesta

```
Pinecone Cloud
  │
  ├─► 1. Convierte pregunta en embedding (vector)
  ├─► 2. Busca documentos similares (búsqueda vectorial)
  ├─► 3. Encuentra los chunks más relevantes
  ├─► 4. Usa un modelo de IA (probablemente GPT)
  ├─► 5. Genera respuesta basada en contexto
  │
  └─► Devuelve respuesta
```

### 5. Backend devuelve al frontend

```python
Backend → { "answer": "IBM RPA tiene comandos como..." }
```

### 6. Frontend muestra al usuario

```
Frontend → Renderiza mensaje del bot con la respuesta
```

---

## 📁 ¿Dónde están los archivos?

### Archivos Originales (IBM RPA docs)

```
/Users/jeronimo/Desktop/ibm_rpa_docs/
├── 0000_IBM_RPA_Studio.md
├── 0001_IBM_RPA_APIs.md
├── 0038_Commands.md
└── ... (miles de archivos .md)
```

**Estado**: En tu computadora, sin modificar

### Archivos al Subirlos

1. **Temporal en tu PC**: Se copia a `/tmp/tmpXXXXX.md` brevemente
2. **Se envía a Pinecone**: El contenido se procesa
3. **Se borra local**: El archivo temporal se elimina
4. **Queda en Pinecone Cloud**: Almacenado como vectores

### ⚠️ Los archivos NO se guardan localmente después de subirlos

Una vez procesados:
- ❌ No están en el backend
- ❌ No están en el frontend
- ✅ Están en Pinecone Cloud como **vectores/embeddings**

---

## 🔐 Seguridad y Privacidad

### ¿Qué se envía a Pinecone?

- ✅ Contenido completo de tus documentos
- ✅ Tus preguntas
- ✅ Historial de consultas

### ¿Pinecone ve mis archivos?

**SÍ**. Pinecone almacena:
- El texto completo de los documentos
- Los embeddings (representaciones vectoriales)
- Las consultas que haces

### ¿Es privado?

**Relativamente**:
- ✅ Solo TÚ tienes acceso (con tu API key)
- ✅ Está encriptado en tránsito (HTTPS)
- ⚠️ Pinecone (la empresa) tiene acceso técnico
- ⚠️ Revisa sus políticas de privacidad

---

## 🆚 ¿Por qué no es 100% local?

### Opción Actual (Pinecone Cloud)
✅ Fácil de configurar
✅ Escalable
✅ Sin necesidad de GPU potente
✅ Modelos de IA actualizados
❌ Requiere internet
❌ Costo mensual (después del tier gratuito)
❌ Los datos están en la nube

### Alternativa 100% Local (requeriría)
- **Ollama** o **LM Studio** (modelos locales)
- **ChromaDB** o **FAISS** (base vectorial local)
- **GPU potente** (para generar embeddings y respuestas)
- **Mucha RAM** (16GB+ recomendado)
- **Más código** y configuración compleja

---

## 🔢 Datos Técnicos

### Backend
- **Lenguaje**: Python 3
- **Framework**: FastAPI
- **Puerto**: 8000
- **Ubicación**: `/Users/jeronimo/Desktop/rag chatbot frontend/backend/`

### Frontend
- **Lenguaje**: JavaScript (React)
- **Bundler**: Vite
- **Puerto**: 5173
- **Ubicación**: `/Users/jeronimo/Desktop/rag chatbot frontend/src/`

### Pinecone
- **Tipo**: Vector Database as a Service
- **API**: Pinecone Assistant API
- **Assistant Name**: `rparag`
- **Conexión**: HTTPS

---

## 💰 Costos

### Pinecone Free Tier
- ✅ Gratis hasta cierto límite
- ✅ 1 índice/project
- ✅ Suficiente para desarrollo/pruebas
- ⚠️ Revisa límites en: https://www.pinecone.io/pricing/

### Si excedes el free tier
- Cobra por vectores almacenados
- Cobra por consultas/mes

---

## 🛠️ ¿Cómo funciona Pinecone Assistant internamente?

```
TU ARCHIVO
   │
   ├─► Extracción de texto
   │
   ├─► Text Splitter (divide en chunks)
   │   └─► Ejemplo: 1 PDF de 100 páginas → 500 chunks de ~200 palabras
   │
   ├─► Embedding Model (convierte texto a vectores)
   │   └─► Ejemplo: "comandos IBM RPA" → [0.23, -0.45, 0.12, ...]
   │
   └─► Vector Database (almacena con metadata)
       └─► {
             vector: [...],
             metadata: {
               filename: "Commands.md",
               page: 5,
               text: "Para trabajar con archivos..."
             }
           }

CUANDO PREGUNTAS
   │
   ├─► Tu pregunta → Embedding → [0.25, -0.42, 0.15, ...]
   │
   ├─► Búsqueda de similitud (cosine similarity)
   │   └─► Encuentra top 5 chunks más similares
   │
   ├─► LLM (GPT o similar) genera respuesta
   │   └─► Prompt: "Basándote en estos documentos: [...chunks...], responde: ¿Qué comandos tiene IBM RPA?"
   │
   └─► Respuesta final
```

---

## 🎯 Resumen Simple

1. **Subes archivos** desde tu navegador
2. **Backend local** los recibe y los envía a Pinecone (cloud)
3. **Pinecone** los procesa, chunka, vectoriza y guarda
4. Cuando **haces una pregunta**:
   - Va de navegador → backend local → Pinecone cloud
   - Pinecone busca info relevante con IA
   - Respuesta regresa: Pinecone → backend → navegador
5. **Los archivos originales** siguen en `/Users/jeronimo/Desktop/ibm_rpa_docs/`
6. **Los vectores** están en Pinecone Cloud

---

## ❓ Preguntas Frecuentes

### ¿Puedo usar esto sin internet?
❌ No. Necesitas internet para que el backend se comunique con Pinecone.

### ¿Los archivos se copian a otro lado?
✅ Sí, se envían a Pinecone Cloud como texto procesado y vectores.

### ¿Puedo eliminar archivos de Pinecone?
⚠️ Con la API actual del Assistant, no hay endpoint directo. Tendrías que recrear el assistant.

### ¿Qué pasa si no tengo internet?
❌ El sistema no funcionará. El backend necesita conectarse a Pinecone.

### ¿Cuántos archivos puedo subir?
⚠️ Depende del tier de Pinecone. El free tier tiene límites de vectores/storage.

### ¿Es rápido?
✅ Sí, las respuestas suelen tomar 2-5 segundos dependiendo de:
  - Tu conexión a internet
  - El tamaño de la consulta
  - La cantidad de documentos

---

## 📞 Contacto

Si tienes dudas sobre:
- **Funcionamiento local**: Revisa este archivo
- **Problemas de conexión**: Verifica tu internet y API key
- **Costos de Pinecone**: https://www.pinecone.io/pricing/
- **Privacidad**: https://www.pinecone.io/security/

---

**Última actualización**: 30 de Enero, 2026
