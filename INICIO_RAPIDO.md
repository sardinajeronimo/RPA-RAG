# 🚀 Guía de Inicio Rápido - Asistente IGV

Sigue estos pasos EN ORDEN para que todo funcione:

---

## 📋 Paso 1: Instalar dependencias del Backend (SOLO LA PRIMERA VEZ)

Abre una terminal y ejecuta:

```bash
cd "/Users/jeronimo/Desktop/rag chatbot frontend/backend"

# Crear entorno virtual de Python
python3 -m venv venv

# Activar el entorno virtual
source venv/bin/activate

# Instalar todas las librerías necesarias
pip install -r requirements.txt
```

**Nota:** Si da error con Python, intenta con `python` en lugar de `python3`

---

## 🔥 Paso 2: Iniciar el Backend (SIEMPRE PRIMERO)

**Abre una PRIMERA terminal** y ejecuta:

```bash
cd "/Users/jeronimo/Desktop/rag chatbot frontend/backend"

# Activar entorno virtual
source venv/bin/activate

# Iniciar el servidor backend
python main.py
```

**Verás algo como:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

✅ **DEJA ESTA TERMINAL ABIERTA** - El backend debe estar corriendo todo el tiempo

---

## 🎨 Paso 3: Iniciar el Frontend (EN OTRA TERMINAL)

**Abre una SEGUNDA terminal** (sin cerrar la primera) y ejecuta:

```bash
cd "/Users/jeronimo/Desktop/rag chatbot frontend"

# Iniciar el frontend
npm run dev
```

**Verás algo como:**
```
  VITE v7.1.7  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

✅ **DEJA ESTA TERMINAL ABIERTA TAMBIÉN**

---

## 🌐 Paso 4: Abrir en el Navegador

1. Abre tu navegador (Chrome, Safari, Firefox)
2. Ve a: **http://localhost:5173**
3. ¡Deberías ver la interfaz del Asistente IGV!

---

## 📤 Paso 5: Subir archivos IBM RPA (OPCIONAL pero recomendado)

Para que el asistente pueda responder sobre IBM RPA:

1. En la interfaz web, click en **"Subir Archivos"** (arriba a la derecha)
2. Navega a: `/Users/jeronimo/Desktop/ibm_rpa_docs`
3. Selecciona varios archivos `.md` (puedes seleccionar múltiples con Cmd+Click)
4. Click "Abrir"
5. Espera a que se procesen (puede tardar unos minutos si subes muchos)

**Recomendación:** Empieza subiendo 5-10 archivos para probar, luego puedes subir más.

---

## ❓ Hacer preguntas

Ahora puedes hacer preguntas como:
- "¿Qué comandos tiene IBM RPA para trabajar con archivos?"
- "Explica cómo funciona el workflow en IBM RPA"
- "¿Cómo automatizo procesos con IBM RPA?"

---

## 🛑 Para detener todo:

1. En ambas terminales presiona: **Ctrl + C**
2. Cierra las terminales

---

## 🔧 Troubleshooting

### ❌ "Puerto 8000 ya está en uso"
```bash
# Encuentra el proceso usando el puerto 8000
lsof -ti:8000 | xargs kill -9
```

### ❌ "Puerto 5173 ya está en uso"
```bash
# Encuentra el proceso usando el puerto 5173
lsof -ti:5173 | xargs kill -9
```

### ❌ "Error: No module named 'fastapi'"
```bash
# Asegúrate de activar el entorno virtual primero
cd "/Users/jeronimo/Desktop/rag chatbot frontend/backend"
source venv/bin/activate
pip install -r requirements.txt
```

### ❌ "No puedo ver la página web"
- Verifica que AMBOS (backend y frontend) estén corriendo
- Revisa que no haya errores en las terminales
- Prueba refrescando el navegador (Cmd + R)

### ❌ "No responde a mis preguntas"
- Primero sube archivos con el botón "Subir Archivos"
- Verifica que el backend esté corriendo (terminal 1)
- Revisa la consola del navegador (F12 > Console) para ver errores

---

## 📁 Estructura de carpetas

```
rag chatbot frontend/
├── backend/              👈 Servidor Python (puerto 8000)
│   ├── main.py          👈 Código principal
│   ├── .env             👈 Tu API key de Pinecone
│   └── venv/            👈 Librerías Python
│
├── src/                 👈 Código React
│   └── App.jsx          👈 Interfaz del chat
│
└── package.json         👈 Dependencias Node.js
```

---

## 📞 ¿Necesitas ayuda?

Si algo no funciona, revisa:
1. ¿Ambas terminales están abiertas y sin errores?
2. ¿El backend muestra "Application startup complete"?
3. ¿El frontend muestra el puerto 5173?
4. ¿Tu navegador está en http://localhost:5173?

---

## 🎯 Resumen Rápido

```bash
# Terminal 1 - Backend
cd "/Users/jeronimo/Desktop/rag chatbot frontend/backend"
source venv/bin/activate
python main.py

# Terminal 2 - Frontend (en otra ventana)
cd "/Users/jeronimo/Desktop/rag chatbot frontend"
npm run dev

# Navegador
# Abre: http://localhost:5173
```

¡Listo! 🎉
