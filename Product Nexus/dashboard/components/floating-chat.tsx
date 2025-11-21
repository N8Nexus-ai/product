'use client'

import { useState, useRef, useEffect } from 'react'
import { Bot, X, Send, Minimize2, MessageCircle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! Sou seu assistente IA. Como posso ajudar você hoje?',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Chamar API do agente
      const response = await api.post('/agents/chat', {
        message: userMessage.content,
        conversation: messages.map(m => ({
          role: m.role,
          content: m.content
        }))
      })

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.data.response || 'Desculpe, não consegui processar sua mensagem.',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error: any) {
      console.error('Error sending message:', error)
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro. Por favor, tente novamente.',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggle = () => {
    if (isOpen) {
      if (isMinimized) {
        setIsMinimized(false)
      } else {
        setIsMinimized(true)
      }
    } else {
      setIsOpen(true)
      setIsMinimized(false)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    setIsMinimized(false)
  }

  return (
    <>
      {/* Botão Flutuante */}
      {!isOpen && (
        <div className="fixed bottom-16 right-16 z-[100] group">
          <button
            onClick={handleToggle}
            className="w-16 h-16 bg-gradient-to-br from-primary via-purple-600 to-blue-600 hover:from-primary hover:via-purple-500 hover:to-blue-500 text-white rounded-full shadow-2xl hover:shadow-primary/50 transition-all duration-300 flex items-center justify-center relative overflow-hidden"
            aria-label="Abrir chat com agente"
            style={{ 
              boxShadow: '0 10px 40px rgba(139, 92, 246, 0.4)',
            }}
          >
            {/* Efeito de brilho animado */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            
            {/* Ícone do robô */}
            <Bot className="w-8 h-8 relative z-10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
            
            {/* Partículas brilhantes ao redor */}
            <Sparkles className="w-4 h-4 text-yellow-300 absolute -top-1 -left-1 animate-pulse opacity-75 pointer-events-none" />
            <Sparkles className="w-3 h-3 text-blue-300 absolute -bottom-1 -right-1 animate-pulse opacity-75 pointer-events-none" style={{ animationDelay: '0.2s' }} />
            <Sparkles className="w-2 h-2 text-purple-300 absolute top-2 -right-2 animate-pulse opacity-75 pointer-events-none" style={{ animationDelay: '0.4s' }} />
            
            {/* Indicador de online - "luz" na cabeça do robô */}
            <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0D0D0D] z-20">
              <span className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75"></span>
              <span className="absolute inset-0 bg-green-400 rounded-full animate-pulse"></span>
            </span>
          </button>
          
          {/* Tooltip */}
          <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-2 bg-[#1a1a1a] text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none border border-white/10 shadow-lg">
            Assistente IA
            <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-[#1a1a1a]"></div>
          </div>
        </div>
      )}

      {/* Janela de Chat */}
      {isOpen && (
        <div
          className={`fixed bottom-16 right-16 w-96 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-2xl flex flex-col z-[100] transition-all duration-300 ${
            isMinimized ? 'h-14' : 'h-[600px]'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#0D0D0D] rounded-t-lg">
            <div className="flex items-center space-x-3">
              <div className="group relative">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-[#1a1a1a] text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none border border-white/10 shadow-lg z-50">
                  Assistente com Inteligência Artificial da Nexus
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#1a1a1a]"></div>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold text-sm">Assistente IA</h3>
                <p className="text-gray-400 text-xs">Online</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-white/10 rounded transition-colors"
                aria-label={isMinimized ? 'Maximizar' : 'Minimizar'}
              >
                <Minimize2 className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={handleClose}
                className="p-1 hover:bg-white/10 rounded transition-colors"
                aria-label="Fechar"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Messages */}
          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.role === 'user'
                          ? 'bg-primary text-white'
                          : 'bg-[#2a2a2a] text-gray-100'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {message.timestamp.toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-[#2a2a2a] text-gray-100 rounded-lg px-4 py-2">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSend} className="p-4 border-t border-white/10 bg-[#0D0D0D]">
                <div className="flex space-x-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    className="flex-1 bg-[#1a1a1a] border border-white/10 text-white placeholder-gray-500 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
      )}
    </>
  )
}
