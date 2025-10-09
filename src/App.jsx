import React, { useState, useRef, useEffect } from 'react';
import { Send, Plus, MessageSquare, Settings, Download, Trash2, Menu, X, Bot, User, Loader2, Copy, Check, Upload, File, FileText, Search, Tag, RefreshCw, BarChart3, Filter, Calendar } from 'lucide-react';

export default function RAGTechnicalSupport() {
  const [conversations, setConversations] = useState([]);
  const [currentConvId, setCurrentConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [documentsOpen, setDocumentsOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [tagsModalOpen, setTagsModalOpen] = useState(false);
  const [selectedDocForTags, setSelectedDocForTags] = useState(null);
  const [webhookUrl, setWebhookUrl] = useState('http://localhost:5678/webhook/ragchat');
  const [uploadWebhookUrl, setUploadWebhookUrl] = useState('http://localhost:5678/webhook-test/ragchat');
  const [copiedId, setCopiedId] = useState(null);
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterByTag, setFilterByTag] = useState('');
  const [availableTags, setAvailableTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [documentStats, setDocumentStats] = useState({});
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('rag-config');
    if (saved) {
      const config = JSON.parse(saved);
      setWebhookUrl(config.webhookUrl || webhookUrl);
      setUploadWebhookUrl(config.uploadWebhookUrl || uploadWebhookUrl);
    }

    const savedDocs = localStorage.getItem('rag-uploaded-docs');
    if (savedDocs) {
      const docs = JSON.parse(savedDocs);
      setUploadedDocs(docs);
      setSelectedDocs(docs.map(d => d.id));
      updateAvailableTags(docs);
    }

    const savedStats = localStorage.getItem('rag-document-stats');
    if (savedStats) {
      setDocumentStats(JSON.parse(savedStats));
    }

    const savedConvs = localStorage.getItem('rag-conversations');
    if (savedConvs) {
      const convs = JSON.parse(savedConvs);
      setConversations(convs);
      if (convs.length > 0) {
        setCurrentConvId(convs[0].id);
        setMessages(convs[0].messages);
      }
    } else {
      createNewConversation();
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('rag-conversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('rag-uploaded-docs', JSON.stringify(uploadedDocs));
    updateAvailableTags(uploadedDocs);
  }, [uploadedDocs]);

  useEffect(() => {
    localStorage.setItem('rag-document-stats', JSON.stringify(documentStats));
  }, [documentStats]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const updateAvailableTags = (docs) => {
    const tags = new Set();
    docs.forEach(doc => {
      if (doc.tags) {
        doc.tags.forEach(tag => tags.add(tag));
      }
    });
    setAvailableTags(Array.from(tags).sort());
  };

  const createNewConversation = () => {
    const newConv = {
      id: `conv-${Date.now()}`,
      title: 'Nueva conversación',
      messages: [],
      createdAt: new Date().toISOString(),
      sessionId: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    setConversations(prev => [newConv, ...prev]);
    setCurrentConvId(newConv.id);
    setMessages([]);
  };

  const selectConversation = (convId) => {
    const conv = conversations.find(c => c.id === convId);
    if (conv) {
      setCurrentConvId(convId);
      setMessages(conv.messages);
    }
  };

  const deleteConversation = (convId, e) => {
    e.stopPropagation();
    const filtered = conversations.filter(c => c.id !== convId);
    setConversations(filtered);
    
    if (currentConvId === convId) {
      if (filtered.length > 0) {
        setCurrentConvId(filtered[0].id);
        setMessages(filtered[0].messages);
      } else {
        createNewConversation();
      }
    }
  };

  const updateConversationTitle = (convId, firstMessage) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === convId && conv.title === 'Nueva conversación') {
        return {
          ...conv,
          title: firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : '')
        };
      }
      return conv;
    }));
  };

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    for (const file of files) {
      if (file.type !== 'application/pdf') {
        alert(`El archivo ${file.name} no es un PDF. Solo se permiten archivos PDF.`);
        continue;
      }

      try {
        const formData = new FormData();
        formData.append('Add pdf', file);

        const response = await fetch(uploadWebhookUrl, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error(`Error al subir ${file.name}: ${response.status}`);
        }

        const newDoc = {
          id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          size: file.size,
          uploadedAt: new Date().toISOString(),
          tags: [],
          qdrantId: file.name // ID usado en Qdrant para poder eliminarlo después
        };

        setUploadedDocs(prev => [...prev, newDoc]);
        setSelectedDocs(prev => [...prev, newDoc.id]);

        // Inicializar estadísticas
        setDocumentStats(prev => ({
          ...prev,
          [newDoc.id]: {
            queriesCount: 0,
            lastQueried: null,
            chunks: 0 // Se podría obtener del backend
          }
        }));

      } catch (err) {
        console.error('Error al subir archivo:', err);
        alert(`Error al subir ${file.name}: ${err.message}`);
      }
    }

    setIsUploading(false);
    event.target.value = '';
  };

  const removeDocument = async (docId) => {
    // Funcionalidad deshabilitada - solo elimina localmente
    setUploadedDocs(prev => prev.filter(d => d.id !== docId));
    setSelectedDocs(prev => prev.filter(id => id !== docId));
    
    setDocumentStats(prev => {
      const newStats = { ...prev };
      delete newStats[docId];
      return newStats;
    });
  };

  const reindexDocument = async (docId) => {
    const doc = uploadedDocs.find(d => d.id === docId);
    if (!doc) return;

    const confirmReindex = window.confirm(`¿Deseas re-indexar "${doc.name}"? Esto lo eliminará y volverá a subir.`);
    if (!confirmReindex) return;

    alert('Por favor selecciona el archivo PDF nuevamente para re-indexarlo');
    fileInputRef.current?.click();
  };

  const toggleDocumentSelection = (docId) => {
    setSelectedDocs(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const addTagToDocument = (docId, tag) => {
    if (!tag.trim()) return;
    
    setUploadedDocs(prev => prev.map(doc => {
      if (doc.id === docId) {
        const tags = doc.tags || [];
        if (!tags.includes(tag.trim())) {
          return { ...doc, tags: [...tags, tag.trim()] };
        }
      }
      return doc;
    }));
  };

  const removeTagFromDocument = (docId, tagToRemove) => {
    setUploadedDocs(prev => prev.map(doc => {
      if (doc.id === docId && doc.tags) {
        return { ...doc, tags: doc.tags.filter(t => t !== tagToRemove) };
      }
      return doc;
    }));
  };

  const openTagsModal = (doc) => {
    setSelectedDocForTags(doc);
    setTagsModalOpen(true);
  };

  const exportDocuments = () => {
    const exportData = uploadedDocs.map(doc => ({
      name: doc.name,
      size: formatFileSize(doc.size),
      uploadedAt: new Date(doc.uploadedAt).toLocaleString('es-ES'),
      tags: doc.tags || [],
      queriesCount: documentStats[doc.id]?.queriesCount || 0,
      lastQueried: documentStats[doc.id]?.lastQueried 
        ? new Date(documentStats[doc.id].lastQueried).toLocaleString('es-ES')
        : 'Nunca'
    }));

    const jsonStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `documentos-rag-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const getFilteredDocuments = () => {
    return uploadedDocs.filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = !filterByTag || (doc.tags && doc.tags.includes(filterByTag));
      return matchesSearch && matchesTag;
    });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');

    const newUserMsg = {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);

    if (messages.length === 0) {
      updateConversationTitle(currentConvId, userMessage);
    }

    // Actualizar estadísticas de uso
    const now = new Date().toISOString();
    selectedDocs.forEach(docId => {
      setDocumentStats(prev => ({
        ...prev,
        [docId]: {
          ...prev[docId],
          queriesCount: (prev[docId]?.queriesCount || 0) + 1,
          lastQueried: now
        }
      }));
    });

    setIsLoading(true);

    try {
      const currentConv = conversations.find(c => c.id === currentConvId);
      const selectedDocNames = uploadedDocs
        .filter(d => selectedDocs.includes(d.id))
        .map(d => d.name);
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatInput: userMessage,
          sessionId: currentConv?.sessionId || `session-${Date.now()}`,
          selectedDocuments: selectedDocNames
        })
      });

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }

      let botResponse = 'No se recibió respuesta del servidor.';
      
      const responseText = await response.text();
      
      if (!responseText || responseText.trim() === '') {
        throw new Error('El servidor devolvió una respuesta vacía');
      }
      
      try {
        const data = JSON.parse(responseText);
        
        if (data.output) {
          botResponse = data.output;
        } else if (data.text) {
          botResponse = data.text;
        } else if (data.message) {
          botResponse = data.message;
        } else if (typeof data === 'string') {
          botResponse = data;
        } else if (typeof data === 'object') {
          const possibleKeys = ['response', 'result', 'answer', 'reply', 'content'];
          for (const key of possibleKeys) {
            if (data[key]) {
              botResponse = data[key];
              break;
            }
          }
          if (botResponse === 'No se recibió respuesta del servidor.') {
            botResponse = JSON.stringify(data, null, 2);
          }
        }
      } catch (jsonError) {
        botResponse = responseText;
      }

      const newBotMsg = {
        role: 'assistant',
        content: botResponse,
        timestamp: new Date().toISOString()
      };

      const finalMessages = [...updatedMessages, newBotMsg];
      setMessages(finalMessages);

      setConversations(prev => prev.map(conv => 
        conv.id === currentConvId 
          ? { ...conv, messages: finalMessages }
          : conv
      ));

    } catch (err) {
      console.error('Error:', err);
      const errorMsg = {
        role: 'error',
        content: `Error: ${err.message}`,
        timestamp: new Date().toISOString()
      };
      const finalMessages = [...updatedMessages, errorMsg];
      setMessages(finalMessages);
      
      setConversations(prev => prev.map(conv => 
        conv.id === currentConvId 
          ? { ...conv, messages: finalMessages }
          : conv
      ));
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const exportConversation = () => {
    const currentConv = conversations.find(c => c.id === currentConvId);
    if (!currentConv) return;

    const content = currentConv.messages
      .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
      .join('\n\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentConv.title}.txt`;
    a.click();
  };

  const copyMessage = (content, msgId) => {
    navigator.clipboard.writeText(content);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const saveSettings = () => {
    localStorage.setItem('rag-config', JSON.stringify({ webhookUrl, uploadWebhookUrl }));
    setSettingsOpen(false);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getTotalStats = () => {
    const totalQueries = Object.values(documentStats).reduce((sum, stat) => sum + (stat.queriesCount || 0), 0);
    const totalSize = uploadedDocs.reduce((sum, doc) => sum + doc.size, 0);
    return { totalQueries, totalSize };
  };

  const filteredDocs = getFilteredDocuments();

  return (
    <div className="flex h-screen bg-white">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 border-r border-gray-200 flex flex-col bg-gray-50`}>
        {sidebarOpen && (
          <>
            <div className="p-4 border-b border-gray-200 space-y-2">
              <button
                onClick={createNewConversation}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all font-medium shadow-lg shadow-blue-500/20"
              >
                <Plus className="w-5 h-5" />
                Nueva conversación
              </button>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setDocumentsOpen(true)}
                  className="flex items-center justify-center gap-1 px-3 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-xs font-medium"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Docs ({uploadedDocs.length})
                </button>
                <button
                  onClick={() => setStatsOpen(true)}
                  className="flex items-center justify-center gap-1 px-3 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-xs font-medium"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  Stats
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => selectConversation(conv.id)}
                  className={`group relative p-3 mb-1 rounded-lg cursor-pointer transition-colors ${
                    currentConvId === conv.id 
                      ? 'bg-gray-200' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 mt-1 text-gray-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate font-medium">
                        {conv.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatDate(conv.createdAt)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => deleteConversation(conv.id, e)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-300 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-gray-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => setSettingsOpen(true)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors text-sm font-medium"
              >
                <Settings className="w-5 h-5" />
                Configuración
              </button>
            </div>
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-semibold text-gray-900">RAG Technical Support</h1>
                <p className="text-xs text-gray-500">
                  {selectedDocs.length} documento{selectedDocs.length !== 1 ? 's' : ''} activo{selectedDocs.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
          
          {messages.length > 0 && (
            <button
              onClick={exportConversation}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Exportar
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-8">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                  <Bot className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  RAG Technical Support
                </h2>
                <p className="text-gray-600 max-w-md mb-6">
                  Sube documentos técnicos y haz preguntas sobre su contenido. 
                  El sistema buscará información relevante en tus archivos.
                </p>
                
                {uploadedDocs.length === 0 ? (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-medium shadow-lg"
                  >
                    <Upload className="w-5 h-5" />
                    Subir primer documento
                  </button>
                ) : (
                  <div className="grid grid-cols-1 gap-3 w-full max-w-xl text-left">
                    {[
                      '¿Qué información contienen estos documentos?',
                      '¿Cuáles son los puntos principales?',
                      'Resume el contenido disponible'
                    ].map((example, idx) => (
                      <button
                        key={idx}
                        onClick={() => setInputMessage(example)}
                        className="p-4 text-sm text-left text-gray-700 bg-white hover:bg-gray-50 rounded-xl transition-all border-2 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow"
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`mb-8 flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                    )}
                    
                    <div className={`flex-1 max-w-2xl ${msg.role === 'user' ? 'flex justify-end' : ''}`}>
                      <div className={`group relative ${
                        msg.role === 'user'
                          ? 'bg-gray-100 rounded-2xl rounded-tr-md px-5 py-3.5'
                          : msg.role === 'error'
                          ? 'bg-red-50 border border-red-200 rounded-2xl px-5 py-3.5'
                          : ''
                      }`}>
                        <p className={`text-sm whitespace-pre-wrap ${
                          msg.role === 'error' ? 'text-red-800' : 'text-gray-900'
                        }`}>
                          {msg.content}
                        </p>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-500">
                            {formatTime(msg.timestamp)}
                          </span>
                          
                          <button
                            onClick={() => copyMessage(msg.content, idx)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded"
                          >
                            {copiedId === idx ? (
                              <Check className="w-3 h-3 text-green-600" />
                            ) : (
                              <Copy className="w-3 h-3 text-gray-500" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {msg.role === 'user' && (
                      <div className="w-8 h-8 bg-gray-300 rounded-lg flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="mb-8 flex gap-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex items-center gap-2 px-4 py-3">
                      <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                      <span className="text-sm text-gray-500">Procesando...</span>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 bg-white p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Escribe tu pregunta..."
                className="flex-1 px-5 py-3.5 bg-white border-2 border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
                disabled={isLoading || uploadedDocs.length === 0}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !inputMessage.trim() || uploadedDocs.length === 0}
                className="px-5 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-400/30"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            {uploadedDocs.length === 0 && (
              <p className="text-xs text-gray-500 text-center mt-2">
                Sube documentos para comenzar a hacer preguntas
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Documents Modal */}
      {documentsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Gestión de Documentos</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedDocs.length} de {uploadedDocs.length} seleccionado{uploadedDocs.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => setDocumentsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filtros y búsqueda */}
            <div className="p-4 border-b border-gray-200 space-y-3">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar documentos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <select
                  value={filterByTag}
                  onChange={(e) => setFilterByTag(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos los tags</option>
                  {availableTags.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all text-sm font-medium disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Subir PDFs
                    </>
                  )}
                </button>
                
                <button
                  onClick={exportDocuments}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all text-sm font-medium"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {filteredDocs.length === 0 ? (
                <div className="text-center py-12">
                  <File className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {uploadedDocs.length === 0 ? 'No hay documentos subidos' : 'No se encontraron documentos'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all ${
                        selectedDocs.includes(doc.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedDocs.includes(doc.id)}
                        onChange={() => toggleDocumentSelection(doc.id)}
                        className="w-5 h-5 mt-1 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <FileText className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-gray-500">
                            {formatFileSize(doc.size)} • {formatDate(doc.uploadedAt)}
                          </p>
                          {documentStats[doc.id]?.queriesCount > 0 && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                              {documentStats[doc.id].queriesCount} consultas
                            </span>
                          )}
                        </div>
                        {doc.tags && doc.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {doc.tags.map(tag => (
                              <span key={tag} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => openTagsModal(doc)}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Gestionar tags"
                        >
                          <Tag className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => reindexDocument(doc.id)}
                          className="p-2 hover:bg-yellow-50 rounded-lg transition-colors"
                          title="Re-indexar"
                        >
                          <RefreshCw className="w-4 h-4 text-yellow-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => setDocumentsOpen(false)}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tags Modal */}
      {tagsModalOpen && selectedDocForTags && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Tags del Documento</h3>
              <button
                onClick={() => setTagsModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4 truncate">{selectedDocForTags.name}</p>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Nuevo tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && newTag.trim()) {
                    addTagToDocument(selectedDocForTags.id, newTag);
                    setNewTag('');
                  }
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => {
                  if (newTag.trim()) {
                    addTagToDocument(selectedDocForTags.id, newTag);
                    setNewTag('');
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                Agregar
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {selectedDocForTags.tags && selectedDocForTags.tags.length > 0 ? (
                selectedDocForTags.tags.map(tag => (
                  <div key={tag} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">{tag}</span>
                    <button
                      onClick={() => removeTagFromDocument(selectedDocForTags.id, tag)}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No hay tags agregados</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats Modal */}
      {statsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Estadísticas de Uso</h2>
              <button
                onClick={() => setStatsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-xl">
                <p className="text-sm text-blue-600 font-medium">Total Documentos</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">{uploadedDocs.length}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-xl">
                <p className="text-sm text-green-600 font-medium">Total Consultas</p>
                <p className="text-2xl font-bold text-green-900 mt-1">{getTotalStats().totalQueries}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl">
                <p className="text-sm text-purple-600 font-medium">Tamaño Total</p>
                <p className="text-2xl font-bold text-purple-900 mt-1">{formatFileSize(getTotalStats().totalSize)}</p>
              </div>
            </div>

            <h3 className="text-sm font-semibold text-gray-700 mb-3">Documentos Más Consultados</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {uploadedDocs
                .sort((a, b) => (documentStats[b.id]?.queriesCount || 0) - (documentStats[a.id]?.queriesCount || 0))
                .slice(0, 10)
                .map(doc => {
                  const stats = documentStats[doc.id] || {};
                  return (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                        {stats.lastQueried && (
                          <p className="text-xs text-gray-500 mt-1">
                            Última consulta: {formatDate(stats.lastQueried)}
                          </p>
                        )}
                      </div>
                      <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        {stats.queriesCount || 0} consultas
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {settingsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Configuración</h2>
              <button
                onClick={() => setSettingsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL del Webhook (Chat)
                </label>
                <input
                  type="text"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="http://localhost:5678/webhook/ragchat"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL del Webhook (Upload)
                </label>
                <input
                  type="text"
                  value={uploadWebhookUrl}
                  onChange={(e) => setUploadWebhookUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="http://localhost:5678/webhook-test/ragchat"
                />
              </div>

              <div className="pt-4 flex gap-2">
                <button
                  onClick={saveSettings}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Guardar
                </button>
                <button
                  onClick={() => setSettingsOpen(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}