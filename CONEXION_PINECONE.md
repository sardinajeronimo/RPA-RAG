# 🔌 Conexión con tu Pinecone Assistant Existente

## ✅ SÍ, está conectado a TU assistant de Pinecone!

---

## 🎯 Cómo Funciona la Conexión

### Tu Pinecone Console (pinecone.io)

```
┌──────────────────────────────────────┐
│     PINECONE CONSOLE                 │
│     (pinecone.io)                    │
│                                      │
│  Tu cuenta:                          │
│  └─ API Key: pcsk_46soWK...         │
│                                      │
│  Tus Assistants:                     │
│  ├─ "rparag" ← 🎯 ESTE SE USA       │
│  │   └─ Archivos:                   │
│  │       └─ comandos IBM RPA ✅     │
│  │                                   │
│  └─ "otro-assistant" (si tienes)    │
└──────────────────────────────────────┘
         ▲
         │ Se conecta con tu API key
         │
┌────────┴─────────────────────────────┐
│  TU BACKEND LOCAL                    │
│  (main.py)                           │
│                                      │
│  .env file:                          │
│  ├─ PINECONE_API_KEY=pcsk_46soWK... │
│  └─ PINECONE_ASSISTANT_NAME=rparag  │
│                                      │
│  Código:                             │
│  pc = Pinecone(api_key=...)         │
│  assistant = pc.assistant.Assistant(│
│      assistant_name="rparag"        │
│  )                                   │
└──────────────────────────────────────┘
```

---

## 🔑 Configuración Actual

### Archivo `.env` (backend):
```env
PINECONE_API_KEY=pcsk_46soWK_NLf9zFrqxTJ5XkzaFemKurm81fEUsu52nXwcJVm9nFK1KUL913Mt8GiZ2vJkxP3
PINECONE_ASSISTANT_NAME=rparag
```

**Esto significa:**
- ✅ Se conecta a TU cuenta de Pinecone
- ✅ Usa el assistant llamado **"rparag"**
- ✅ Si ya tienes archivos en ese assistant, **los usará inmediatamente**

---

## 📁 ¿Qué pasa con los archivos?

### Si YA tienes archivos en "rparag":
```
Pinecone Console → Assistant "rparag"
  └─ comandos IBM RPA.pdf ✅

Cuando hagas una pregunta en el frontend:
  └─ El backend pregunta al assistant "rparag"
      └─ Pinecone busca en TUS archivos existentes
          └─ Responde usando ese contenido ✅
```

### Si subes MÁS archivos desde el frontend:
```
Frontend → "Subir Archivos" → Seleccionas nuevos PDFs
  └─ Se agregan al MISMO assistant "rparag"
      └─ Ahora tendrás:
          ├─ comandos IBM RPA.pdf (el que ya tenías)
          └─ nuevos archivos que subiste ✅
```

---

## 🪙 Tema de Tokens y Costos

### ¿Qué son los "tokens"?

En Pinecone NO se llaman "tokens" como en OpenAI. Se miden:

1. **Vectores almacenados** (storage)
   - Cada chunk de documento = 1 vector
   - Ejemplo: 1 PDF de 100 páginas ≈ 500 vectores

2. **Consultas (queries)**
   - Cada pregunta que haces = 1 query
   - Incluye: búsqueda vectorial + generación de respuesta con LLM

3. **Procesamiento de archivos**
   - Cuando subes un archivo, se procesa (chunking + embeddings)

---

## 💰 Costos de Pinecone (2024-2026)

### **Free Tier** (Starter)
```
✅ GRATIS incluye:
├─ 1 proyecto
├─ 1 assistant
├─ 100,000 consultas/mes
├─ Almacenamiento limitado de vectores
└─ Suficiente para desarrollo/pruebas
```

### **Si excedes el Free Tier**
```
Serverless Plan:
├─ Storage: ~$0.025 por GB/mes
├─ Read units: Depende del uso
└─ Write units: Al subir archivos

Pod-based Plan:
└─ Desde $70/mes (más capacidad)
```

**Fuente:** https://www.pinecone.io/pricing/

---

## 📊 ¿Cuánto estás usando?

### Ver tu uso actual:

1. Ve a: https://app.pinecone.io/
2. Login con tu cuenta
3. Click en **"Billing"** o **"Usage"** (barra lateral)
4. Verás:
   - Queries este mes
   - Vectores almacenados
   - Storage usado
   - Si estás en free tier o no

---

## ⚡ Optimizar Costos

### 1. **No subas archivos duplicados**
```
❌ MAL: Subir el mismo archivo 10 veces
✅ BIEN: Subir cada archivo solo una vez
```

### 2. **Usa el mismo assistant**
```
✅ Reutiliza "rparag" con todos tus archivos
❌ No crees assistants nuevos innecesariamente
```

### 3. **Borra archivos que no necesites**
```
Si tienes archivos viejos en Pinecone Console:
└─ Puedes eliminarlos para liberar espacio
```

### 4. **Haz consultas eficientes**
```
❌ MAL: Hacer 100 preguntas sobre lo mismo
✅ BIEN: Hacer preguntas claras y específicas
```

---

## 🔍 ¿Cómo saber qué assistant tienes?

### Opción 1: Pinecone Console (Web)
1. Ve a: https://app.pinecone.io/
2. Click en **"Assistants"** (barra lateral)
3. Verás lista de assistants:
   ```
   ├─ rparag ← Este es el que usas
   │   └─ Files: comandos IBM RPA.pdf
   └─ otros...
   ```

### Opción 2: Desde el backend (Python)
```python
from pinecone import Pinecone

pc = Pinecone(api_key="tu-api-key")

# Listar assistants
assistants = pc.assistant.list_assistants()
print(assistants)
```

---

## 🔄 Flujo Completo (con tu assistant existente)

```
1. TÚ YA TIENES:
   └─ Pinecone Assistant "rparag"
       └─ comandos IBM RPA.pdf

2. INICIAS EL BACKEND:
   └─ Se conecta a TU assistant "rparag"
   └─ Usa tu API key

3. HACES UNA PREGUNTA:
   Frontend → Backend → Pinecone Assistant "rparag"
   └─ Pinecone busca en los archivos que YA TIENES
   └─ Responde usando ese contenido ✅

4. SI SUBES MÁS ARCHIVOS:
   └─ Se agregan al MISMO assistant "rparag"
   └─ Ahora puede responder con MÁS información
```

---

## ⚠️ IMPORTANTE: Nombre del Assistant

### Tu archivo `.env` dice:
```env
PINECONE_ASSISTANT_NAME=rparag
```

**Verifica que en Pinecone Console tengas un assistant llamado exactamente "rparag"**

Si tu assistant se llama diferente (ej: "mi-assistant"), cambia el `.env`:
```env
PINECONE_ASSISTANT_NAME=mi-assistant
```

---

## 🧪 Probar la Conexión

### Método 1: Desde el navegador
1. Inicia backend y frontend
2. Abre: http://localhost:8000/health
3. Deberías ver:
   ```json
   {
     "status": "healthy",
     "pinecone": "connected",
     "assistant": "rparag"
   }
   ```

### Método 2: Hacer una pregunta
1. Abre el frontend: http://localhost:5173
2. Escribe: "¿Qué comandos tiene IBM RPA?"
3. Si ya tienes ese archivo en Pinecone:
   - ✅ Debería responder con información del archivo
4. Si no tienes archivos aún:
   - ⚠️ Dirá "No encontré información"

---

## 📝 Resumen

| Pregunta | Respuesta |
|----------|-----------|
| ¿Se conecta a MI Pinecone? | ✅ Sí, con tu API key |
| ¿Usa mis archivos existentes? | ✅ Sí, si están en el assistant "rparag" |
| ¿Puedo subir más archivos? | ✅ Sí, se agregan al mismo assistant |
| ¿Cuánto cuesta? | 🆓 Free tier hasta 100k queries/mes |
| ¿Cómo veo mi uso? | 🌐 https://app.pinecone.io/ → Billing |
| ¿Qué son "tokens"? | 📊 Pinecone usa: vectores + queries |

---

## 🎯 Próximos Pasos

1. **Verifica tu assistant en Pinecone Console**
   - ¿Se llama "rparag"?
   - ¿Tiene archivos cargados?

2. **Inicia el backend y frontend**
   ```bash
   # Terminal 1
   cd "/Users/jeronimo/Desktop/rag chatbot frontend/backend"
   source venv/bin/activate
   python main.py

   # Terminal 2
   cd "/Users/jeronimo/Desktop/rag chatbot frontend"
   npm run dev
   ```

3. **Prueba haciendo una pregunta**
   - Sobre los archivos que ya tienes en Pinecone
   - Debería funcionar inmediatamente ✅

4. **Opcional: Sube más archivos**
   - Usa el botón "Subir Archivos"
   - Selecciona los `.md` de `/Users/jeronimo/Desktop/ibm_rpa_docs`

---

**¿Tienes más preguntas sobre la conexión o los costos?** 🤔
