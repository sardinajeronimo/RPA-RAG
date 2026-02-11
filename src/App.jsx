import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Copy, Check, Upload, X, FileText, AlertCircle } from 'lucide-react';

export default function IGVChatbot() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [sessionId] = useState(`session-${Date.now()}`);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  // API endpoint del backend
  const API_URL = 'http://localhost:8000';

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');

    // Agregar mensaje del usuario
    const newUserMsg = {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // Llamar al backend FastAPI
      const response = await fetch(`${API_URL}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: userMessage,
          session_id: sessionId
        })
      });

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const data = await response.json();

      // Agregar respuesta del asistente
      const newBotMsg = {
        role: 'assistant',
        content: data.answer || 'No se recibió respuesta del servidor.',
        timestamp: new Date().toISOString()
      };

      setMessages([...updatedMessages, newBotMsg]);

    } catch (err) {
      console.error('Error:', err);
      const errorMsg = {
        role: 'error',
        content: `Error: ${err.message}. Asegúrate de que el backend esté corriendo en ${API_URL}`,
        timestamp: new Date().toISOString()
      };
      setMessages([...updatedMessages, errorMsg]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadResults([]);
    setUploadModalOpen(true);

    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await fetch(`${API_URL}/upload-multiple`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const data = await response.json();
      setUploadResults(data);

    } catch (err) {
      console.error('Error:', err);
      setUploadResults({
        total: files.length,
        successful: 0,
        failed: files.length,
        errors: files.map(f => ({ filename: f.name, error: err.message }))
      });
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const copyMessage = (content, msgId) => {
    navigator.clipboard.writeText(content);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex h-screen bg-white">
      {/* File input hidden */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.pdf,.md,.markdown,.doc,.docx"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header con logo IGV - Visanet style */}
        <div className="border-b border-gray-700 px-6 py-4 flex items-center justify-between bg-white shadow-sm">
          <div className="flex items-center gap-4">
            {/* Logo IGV oficial */}
            <div className="flex items-center gap-3">
              <img
                src="/igv-logo.jpg"
                alt="IGV SRL Uruguay"
                className="h-12 object-contain"
              />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Asistente RPA</h1>
              </div>
            </div>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-blue-700 text-white rounded-lg transition-all shadow-md"
          >
            <Upload className="w-4 h-4" />
            <span className="text-sm font-medium">Subir Archivos</span>
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 py-8">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-16">
                <div className="mb-6">
                  <img
                    src="/igv-logo.jpg"
                    alt="IGV SRL Uruguay"
                    className="h-24 object-contain mx-auto"
                  />
                </div>
                <h2 className="text-3xl font-semibold text-gray-900 mb-3">
                 IBM RPA
                </h2>
                <p className="text-gray-600 max-w-lg mb-8 text-lg">
                  Haz preguntas sobre RPA, automatización de procesos y más. 
                </p>

                {/* Ejemplos de preguntas - Visanet style */}
                <div className="grid grid-cols-1 gap-3 w-full max-w-2xl">
                  {[
                  ].map((example, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInputMessage(example)}
                      className="p-4 text-left text-gray-700 bg-white hover:bg-gray-50 rounded-xl transition-all border-2 border-gray-200 hover:border-blue-500 shadow-sm hover:shadow hover:transform hover:translateX-1"
                    >
                      <span className="text-sm font-medium">{example}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`mb-6 flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {/* Message Content - Visanet style */}
                    <div className="max-w-[80%]">
                      <div className={`group relative ${
                        msg.role === 'user'
                          ? 'bg-gray-700 text-white rounded-2xl px-5 py-3 shadow leading-relaxed transition-all duration-300 ease-in-out transform'
                          : msg.role === 'error'
                          ? 'bg-red-50 border border-red-200 rounded-2xl px-5 py-4'
                          : 'bg-transparent text-black rounded-2xl px-5 py-3 leading-relaxed transition-all duration-300 ease-in-out transform'
                      }`}>
                        <p className={`text-base whitespace-pre-wrap leading-relaxed ${
                          msg.role === 'error' ? 'text-red-800' : msg.role === 'user' ? 'text-white' : 'text-gray-800'
                        }`}>
                          {msg.content}
                        </p>

                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-xs ${msg.role === 'user' ? 'text-gray-300' : 'text-gray-400'}`}>
                            {formatTime(msg.timestamp)}
                          </span>

                          <button
                            onClick={() => copyMessage(msg.content, idx)}
                            className={`opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded ${
                              msg.role === 'user' ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                            }`}
                          >
                            {copiedId === idx ? (
                              <Check className="w-3.5 h-3.5 text-green-600" />
                            ) : (
                              <Copy className={`w-3.5 h-3.5 ${msg.role === 'user' ? 'text-gray-300' : 'text-gray-500'}`} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="mb-6">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="progress-bar rounded-full mb-3"></div>
                      <div className="text-sm text-gray-600 flex items-center gap-2">
                        <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                        <span>Buscando información y generando respuesta...</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="border-t border-gray-700 bg-white px-4 py-4 shadow-lg">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Escribí tu consulta..."
                className="flex-1 bg-gray-700 text-white rounded-lg px-5 py-2 text-base placeholder-white placeholder:italic focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="bg-gray-700 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <div className="flex justify-center mt-2">
              <button
                onClick={() => {
                  setMessages([]);
                  setInputMessage('');
                }}
                className="text-gray-700 hover:text-blue-700 underline text-sm transition"
              >
                Reiniciar chat
              </button>
            </div>
          </div>
        </div>
      </div>

      {uploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col slide-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {isUploading ? 'Subiendo archivos...' : 'Resultados de carga'}
              </h2>
              {!isUploading && (
                <button
                  onClick={() => setUploadModalOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {isUploading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                  <p className="text-gray-600">Procesando archivos...</p>
                </div>
              ) : uploadResults.total ? (
                <div className="space-y-4">
                  {/* Summary */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-xl">
                      <p className="text-sm text-blue-600 font-medium">Total</p>
                      <p className="text-2xl font-bold text-blue-900">{uploadResults.total}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-xl">
                      <p className="text-sm text-green-600 font-medium">Exitosos</p>
                      <p className="text-2xl font-bold text-green-900">{uploadResults.successful}</p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-xl">
                      <p className="text-sm text-red-600 font-medium">Fallidos</p>
                      <p className="text-2xl font-bold text-red-900">{uploadResults.failed}</p>
                    </div>
                  </div>

                  {/* Success list */}
                  {uploadResults.results && uploadResults.results.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">Archivos procesados:</h3>
                      <div className="space-y-2">
                        {uploadResults.results.map((result, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                            <FileText className="w-5 h-5 text-green-600" />
                            <span className="text-sm text-gray-700">{result.filename}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Error list */}
                  {uploadResults.errors && uploadResults.errors.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">Errores:</h3>
                      <div className="space-y-2">
                        {uploadResults.errors.map((error, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{error.filename}</p>
                              <p className="text-xs text-red-600 mt-1">{error.error}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {!isUploading && (
              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={() => setUploadModalOpen(false)}
                  className="w-full px-4 py-2 bg-gray-700 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                >
                  Cerrar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
