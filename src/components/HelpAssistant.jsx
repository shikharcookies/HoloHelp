import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mic, SendHorizonal, Bot, User, Loader2, AlertCircle, Wifi, WifiOff, Settings, Lightbulb, Sparkles, CheckCircle, Clock, Wrench, Shield } from 'lucide-react'
import { chatAPI, healthAPI, errorHandler } from '@/services/api'
import { geminiService } from '@/services/geminiService'

// Enhanced message formatter component
const FormattedMessage = ({ text, type, powered_by }) => {
  const formatText = (text) => {
    if (!text) return null

    // Split by double newlines to handle paragraphs
    const paragraphs = text.split('\n\n')
    
    return paragraphs.map((paragraph, pIndex) => {
      if (!paragraph.trim()) return null
      
      const lines = paragraph.split('\n')
      
      return (
        <div key={pIndex} className={`${pIndex > 0 ? 'mt-4' : ''}`}>
          {lines.map((line, lIndex) => {
            if (!line.trim()) return null
            
            // Check for different line types
            if (line.match(/^\*\*.*\*\*$/)) {
              // Main headers
              const headerText = line.replace(/^\*\*|\*\*$/g, '')
              return (
                <div key={lIndex} className="mb-3">
                  <h3 className={`text-lg font-bold ${
                    powered_by === 'gemini' ? 'text-purple-800' : 'text-blue-800'
                  } flex items-center gap-2`}>
                    {headerText.includes('Step') && <Clock className="w-4 h-4" />}
                    {headerText.includes('Tools') && <Wrench className="w-4 h-4" />}
                    {headerText.includes('Safety') && <Shield className="w-4 h-4" />}
                    {headerText}
                  </h3>
                </div>
              )
            }
            
            if (line.match(/^\*\*Step \d+:/)) {
              // Step headers
              const stepText = line.replace(/^\*\*|\*\*$/g, '')
              const [stepNum, ...titleParts] = stepText.split(':')
              const title = titleParts.join(':').trim()
              
              return (
                <div key={lIndex} className="mb-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-l-4 border-purple-500">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {stepNum.replace('Step ', '')}
                    </div>
                    <h4 className="font-bold text-purple-800">{title}</h4>
                  </div>
                </div>
              )
            }
            
            if (line.match(/^\d+\./)) {
              // Numbered lists
              const [number, ...textParts] = line.split('.')
              const text = textParts.join('.').trim()
              
              return (
                <div key={lIndex} className="flex items-start gap-3 mb-2">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                    {number}
                  </div>
                  <span className="text-gray-700 leading-relaxed">{formatInlineText(text)}</span>
                </div>
              )
            }
            
            if (line.startsWith('•') || line.startsWith('-')) {
              // Bullet points
              const text = line.replace(/^[•-]\s*/, '')
              return (
                <div key={lIndex} className="flex items-start gap-3 mb-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex-shrink-0 mt-2"></div>
                  <span className="text-gray-700 leading-relaxed">{formatInlineText(text)}</span>
                </div>
              )
            }
            
            if (line.match(/^\*[^*]/)) {
              // Single asterisk items
              const text = line.replace(/^\*\s*/, '')
              return (
                <div key={lIndex} className="flex items-start gap-3 mb-2 ml-4">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full flex-shrink-0 mt-2.5"></div>
                  <span className="text-gray-600 text-sm leading-relaxed">{formatInlineText(text)}</span>
                </div>
              )
            }
            
            // Regular paragraphs
            return (
              <p key={lIndex} className="text-gray-700 leading-relaxed mb-2">
                {formatInlineText(line)}
              </p>
            )
          })}
        </div>
      )
    })
  }

  const formatInlineText = (text) => {
    if (!text) return text
    
    // Handle bold text **text**
    const parts = text.split(/(\*\*.*?\*\*)/)
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const boldText = part.slice(2, -2)
        return (
          <strong key={index} className="font-semibold text-gray-800">
            {boldText}
          </strong>
        )
      }
      
      // Handle time estimates
      if (part.match(/\d+\s*(minutes?|mins?|hours?|seconds?)/i)) {
        return (
          <span key={index} className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3" />
            {part}
          </span>
        )
      }
      
      return part
    })
  }

  return (
    <div className={`space-y-2 ${
      type === 'assembly' ? 'assembly-format' : 
      type === 'troubleshooting' ? 'troubleshooting-format' : ''
    }`}>
      {formatText(text)}
    </div>
  )
}

const HelpAssistant = ({ detectedDevice = null, context = null }) => {
  const [messages, setMessages] = useState([
    { 
      sender: 'bot', 
      text: 'Hi! I\'m your AI-powered HoloHelp Assistant! 🚀\n\nI can help you with:\n\n**Assembly instructions** for ANY item (Samsung TV, IKEA furniture, gaming setup, etc.)\n\n**Device troubleshooting** for electronics and appliances\n\n**Step-by-step guidance** for repairs and maintenance\n\nJust ask me something like "How to assemble a Samsung TV stand?" or "Fix my WiFi router" and I\'ll provide detailed instructions!\n\n✨ Now powered by Gemini AI for unlimited possibilities!', 
      timestamp: Date.now(),
      type: 'welcome',
      powered_by: 'gemini'
    }
  ])
  const [input, setInput] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState('checking')
  const [geminiAvailable, setGeminiAvailable] = useState(false)
  const recognitionRef = useRef(null)
  const messagesEndRef = useRef(null)

  // Check backend connection and Gemini availability
  useEffect(() => {
    const checkConnections = async () => {
      try {
        await healthAPI.checkStatus()
        setIsOnline(true)
        setConnectionStatus('online')
      } catch {
        setIsOnline(false)
        setConnectionStatus('offline')
      }

      // Check Gemini availability
      setGeminiAvailable(geminiService.isAvailable())
    }

    checkConnections()
    const interval = setInterval(checkConnections, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = useCallback(async (messageText = input) => {
    if (!messageText.trim()) return

    const userMsg = messageText.trim()
    const timestamp = Date.now()
    
    setMessages(prev => [...prev, { 
      sender: 'user', 
      text: userMsg, 
      timestamp 
    }])
    setInput('')
    setIsLoading(true)

    try {
      // Try Gemini first if available
      if (geminiAvailable) {
        console.log('🤖 Using Gemini AI for response...')
        
        const chatContext = {
          detectedDevice: detectedDevice?.deviceModel || null,
          deviceType: detectedDevice?.deviceType || null,
          conversationContext: context,
          timestamp: new Date().toISOString(),
          userLocation: 'Bengaluru, Karnataka, IN'
        }

        const response = await geminiService.processMessage(userMsg, chatContext)
        
        setMessages(prev => [...prev, {
          sender: 'bot',
          text: response.text,
          timestamp: Date.now(),
          type: response.type,
          powered_by: 'gemini'
        }])
        
        return
      }
      
      // Fallback to backend API if online
      if (isOnline) {
        console.log('🌐 Using backend API...')
        const chatContext = {
          detectedDevice: detectedDevice?.deviceModel || null,
          deviceType: detectedDevice?.deviceType || null,
          conversationContext: context
        }

        const response = await chatAPI.sendMessage(
          userMsg, 
          JSON.stringify(chatContext),
          detectedDevice?.deviceType
        )

        setMessages(prev => [...prev, {
          sender: 'bot',
          text: response.response,
          timestamp: Date.now(),
          type: 'api',
          powered_by: 'backend'
        }])
        
        return
      }
      
      // Local fallback responses
      console.log('💾 Using local fallback...')
      const response = getLocalResponse(userMsg)
      
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: response.text,
        timestamp: Date.now(),
        type: response.type,
        powered_by: 'local'
      }])

    } catch (error) {
      console.error('Chat error:', error)
      let errorMessage = "I encountered an issue, but I can still help! "
      
      if (!geminiAvailable && !isOnline) {
        errorMessage += "For the best experience, please:\n\n**1.** Add your Gemini API key to enable AI features\n\n**2.** Start the backend server for enhanced functionality"
      } else if (!geminiAvailable) {
        errorMessage += "Add your Gemini API key for enhanced AI assistance!"
      } else {
        errorMessage += errorHandler.getErrorMessage(error)
      }
      
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: errorMessage,
        timestamp: Date.now(),
        isError: true
      }])
    } finally {
      setIsLoading(false)
    }
  }, [input, isOnline, geminiAvailable, detectedDevice, context])

  // Enhanced local responses for when AI is not available
  const getLocalResponse = (message) => {
    const lowerMessage = message.toLowerCase()
    
    // Assembly requests
    if (lowerMessage.includes('build') || lowerMessage.includes('assemble') || lowerMessage.includes('assembly')) {
      if (lowerMessage.includes('tv') || lowerMessage.includes('television')) {
        return {
          type: 'assembly',
          text: `**TV Assembly Guide**\n\n**Step 1: Unpack Components** *(5 minutes)*\n• Remove TV, stand, screws, and manual from box\n• Lay TV face-down on soft surface\n\n**Step 2: Attach Stand Base** *(10 minutes)*\n• Align stand with mounting holes\n• Secure with provided screws\n\n**Step 3: Connect Cables** *(8 minutes)*\n• Attach power cord and HDMI cables\n• Route cables through stand management\n\n**Step 4: Final Setup** *(5 minutes)*\n• Place TV upright carefully\n• Test stability and adjust\n\n**Tools needed:** Phillips screwdriver\n\n**Total time:** ~30 minutes\n\n*For AI-powered detailed instructions for ANY item, add your Gemini API key!*`
        }
      }
      
      return {
        type: 'assembly',
        text: `**General Assembly Help**\n\nI can provide basic assembly guidance! For detailed, AI-generated step-by-step instructions for ANY item, please add your Gemini API key.\n\n**Current capabilities:**\n• Basic TV and furniture assembly\n• Tool recommendations\n• Safety tips\n\n**With Gemini AI:**\n• Custom instructions for ANY item\n• Detailed step-by-step guides\n• Troubleshooting help\n\nWhat specific item are you assembling?`
      }
    }
    
    // Thank you responses
    if (lowerMessage.includes('thank')) {
      return {
        type: 'chat',
        text: `You're very welcome! 😊\n\nI'm here to help with assembly, troubleshooting, and more. For the best experience with detailed AI-generated instructions for ANY item, consider adding your Gemini API key!\n\n**What else can I help you with?**\n• Assembly instructions\n• Device troubleshooting\n• Repair guidance\n• Tool recommendations`
      }
    }
    
    // Greetings
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return {
        type: 'chat',
        text: `Hello! 👋 I'm your HoloHelp Assistant!\n\nI can help with assembly instructions, device troubleshooting, and more.\n\n**Try asking:**\n• "How to build a Samsung TV stand?"\n• "Fix my WiFi router"\n• "Assemble IKEA desk"\n\n🚀 **Pro tip:** Add your Gemini API key for AI-powered help with ANY item!`
      }
    }
    
    return {
      type: 'general',
      text: `I'm here to help with assembly and troubleshooting! 🔧\n\n**What I can do:**\n• Assembly instructions for common items\n• Basic troubleshooting guidance\n• Tool and safety recommendations\n\n**For enhanced AI assistance:**\nAdd your Gemini API key to get detailed, step-by-step instructions for ANY item or device!\n\nWhat would you like help with?`
    }
  }

  // Speech recognition setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.lang = 'en-US'
      recognition.interimResults = false
      recognition.maxAlternatives = 1

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        handleSend(transcript)
      }

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsRecording(false)
      }
      
      recognition.onend = () => setIsRecording(false)

      recognitionRef.current = recognition
    }
  }, [handleSend])

  const handleMicClick = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition not supported in this browser')
      return
    }

    if (isRecording) {
      recognitionRef.current.stop()
    } else {
      setIsRecording(true)
      recognitionRef.current.start()
    }
  }

  const getConnectionIcon = () => {
    if (geminiAvailable) {
      return <Sparkles className="w-4 h-4 text-purple-500 animate-pulse" />
    }
    
    switch (connectionStatus) {
      case 'online':
        return <Wifi className="w-4 h-4 text-green-500" />
      case 'offline':
        return <WifiOff className="w-4 h-4 text-red-500" />
      default:
        return <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
    }
  }

  const getMessageIcon = (message) => {
    if (message.sender === 'user') {
      return <User className="w-4 h-4 text-blue-600" />
    }
    
    if (message.isError) {
      return <AlertCircle className="w-4 h-4 text-red-500" />
    }
    
    if (message.powered_by === 'gemini') {
      return <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />
    }
    
    if (message.type === 'assembly' || message.type === 'troubleshooting') {
      return <Settings className="w-4 h-4 text-blue-600" />
    }
    
    return <Bot className="w-4 h-4 text-green-600" />
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const getConnectionStatus = () => {
    if (geminiAvailable) return 'AI Enhanced'
    if (connectionStatus === 'online') return 'Backend Connected'
    return 'Offline Mode'
  }

  const getConnectionColor = () => {
    if (geminiAvailable) return 'text-purple-600'
    if (connectionStatus === 'online') return 'text-green-600'
    return 'text-orange-600'
  }

  const quickActions = [
    "How to assemble Samsung TV stand?",
    "Fix my WiFi router",
    "Build IKEA desk",
    "Troubleshoot microwave",
    "Computer assembly guide"
  ]

  return (
    <div className="w-full max-w-3xl mx-auto my-4 bg-white/95 rounded-2xl shadow-xl backdrop-blur-md border border-white/20">
      {/* Enhanced Header with AI Status */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {geminiAvailable ? (
              <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            ) : (
              <div className="p-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl">
                <Bot className="w-6 h-6 text-white" />
              </div>
            )}
            <div>
              <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2">
                HoloHelp Assistant
                {geminiAvailable && (
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-3 py-1 rounded-full font-medium animate-pulse">
                    ✨ AI Enhanced
                  </span>
                )}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {geminiAvailable ? '🤖 AI-Powered Assembly & Troubleshooting Expert' : '🔧 Assembly & Device Assistant'}
              </p>
            </div>
            {detectedDevice && (
              <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
                📱 {detectedDevice.deviceType}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm">
            {getConnectionIcon()}
            <span className={`font-medium ${getConnectionColor()}`}>
              {getConnectionStatus()}
            </span>
          </div>
        </div>
        
        {/* AI Enhancement Notice */}
        {!geminiAvailable && (
          <div className="mt-4 p-3 bg-gradient-to-r from-purple-100 via-blue-100 to-pink-100 rounded-xl border border-purple-200">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">
                💡 Add Gemini API key for AI-powered instructions for ANY item!
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="h-96 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50/30 to-white">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[90%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mt-1 shadow-sm">
                {getMessageIcon(msg)}
              </div>
              
              <div className={`relative px-6 py-4 rounded-2xl text-sm shadow-lg ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md'
                  : msg.isError
                  ? 'bg-gradient-to-br from-red-50 to-red-100 text-red-800 border border-red-200 rounded-bl-md'
                  : msg.powered_by === 'gemini'
                  ? 'bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 text-gray-800 border border-purple-200 rounded-bl-md'
                  : msg.type === 'assembly' || msg.type === 'troubleshooting'
                  ? 'bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-900 border border-blue-200 rounded-bl-md'
                  : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 border border-gray-200 rounded-bl-md'
              }`}>
                {msg.sender === 'user' ? (
                  <div className="font-medium">{msg.text}</div>
                ) : (
                  <FormattedMessage 
                    text={msg.text} 
                    type={msg.type} 
                    powered_by={msg.powered_by} 
                  />
                )}
                
                {/* AI/Service indicator */}
                {msg.powered_by && msg.sender === 'bot' && (
                  <div className="mt-3 pt-3 border-t border-gray-200/50 flex items-center gap-2">
                    {msg.powered_by === 'gemini' && (
                      <>
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <span className="text-xs text-purple-600 font-medium bg-purple-100 px-2 py-1 rounded-full">
                          ✨ AI Enhanced
                        </span>
                      </>
                    )}
                    {msg.powered_by === 'backend' && (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-xs text-green-600 font-medium bg-green-100 px-2 py-1 rounded-full">
                          🌐 Backend API
                        </span>
                      </>
                    )}
                    {msg.powered_by === 'local' && (
                      <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded-full">
                        💾 Local Response
                      </span>
                    )}
                  </div>
                )}
                
                {/* Message metadata */}
                <div className={`text-xs mt-3 opacity-75 ${
                  msg.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    {formatTime(msg.timestamp)}
                    {msg.type && msg.type !== 'general' && (
                      <span className="ml-2 capitalize bg-white/20 px-2 py-0.5 rounded-full">
                        {msg.type.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-sm">
                {geminiAvailable ? (
                  <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />
                ) : (
                  <Bot className="w-4 h-4 text-green-600" />
                )}
              </div>
              <div className={`px-6 py-4 rounded-2xl rounded-bl-md shadow-lg ${
                geminiAvailable 
                  ? 'bg-gradient-to-r from-purple-100 via-blue-100 to-pink-100 text-purple-800'
                  : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800'
              }`}>
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="font-medium">
                    {geminiAvailable ? '🤖 AI is thinking...' : '⚙️ Processing...'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced Quick Actions */}
      {!isLoading && messages.length <= 2 && (
        <div className="px-6 pb-4">
          <div className="text-sm text-gray-600 mb-3 flex items-center gap-2 font-medium">
            <Lightbulb className="w-4 h-4 text-yellow-500" />
            Try these examples:
          </div>
          <div className="flex flex-wrap gap-3">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(action)}
                className={`text-sm px-4 py-2 rounded-xl transition-all hover:scale-105 transform shadow-md ${
                  geminiAvailable
                    ? 'bg-gradient-to-r from-purple-100 via-blue-100 to-pink-100 hover:from-purple-200 hover:via-blue-200 hover:to-pink-200 text-purple-700 border border-purple-200'
                    : 'bg-gradient-to-r from-blue-100 to-gray-100 hover:from-blue-200 hover:to-gray-200 text-gray-700 border border-gray-200'
                }`}
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Input */}
      <div className="p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50/50 to-white rounded-b-2xl">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <Input
              className="rounded-xl border-2 border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 resize-none bg-white shadow-sm text-base py-3 px-4"
              placeholder={
                geminiAvailable 
                  ? "✨ Ask me to assemble ANY item or troubleshoot ANY device..."
                  : isOnline 
                  ? "🤔 Ask about assembly, devices, or say 'help'..."
                  : "📴 Offline mode - basic assembly help available!"
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              disabled={isLoading}
            />
          </div>
          
          <Button
            className={`rounded-xl px-4 py-3 text-white font-medium shadow-lg transform transition-all hover:scale-105 ${
              geminiAvailable
                ? 'bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 hover:from-purple-700 hover:via-blue-700 hover:to-pink-700'
                : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
            }`}
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <SendHorizonal className="w-5 h-5" />
            )}
          </Button>
          
          <Button
            onClick={handleMicClick}
            disabled={isLoading}
            className={`rounded-xl px-4 py-3 font-medium shadow-lg transform transition-all hover:scale-105 ${
              isRecording 
                ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 animate-pulse' 
                : 'bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600'
            } text-white`}
          >
            <Mic className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Enhanced Status indicators */}
        <div className="flex justify-between items-center mt-4 text-sm">
          <div className="flex items-center gap-4">
            {isRecording && (
              <span className="text-red-600 animate-pulse flex items-center gap-2 bg-red-50 px-3 py-1 rounded-full border border-red-200">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-ping"></div>
                🎤 Recording...
              </span>
            )}
            {geminiAvailable && (
              <span className="text-purple-600 flex items-center gap-2 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                <Sparkles className="w-4 h-4 animate-pulse" />
                ✨ AI Enhanced Mode
              </span>
            )}
            {detectedDevice && (
              <span className="text-green-600 flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                📱 Device context available
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3 text-gray-500">
            {!geminiAvailable && !isOnline && (
              <span className="text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200 text-xs">
                ⚠️ Limited functionality
              </span>
            )}
            {!geminiAvailable && isOnline && (
              <span className="text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-200 text-xs">
                🔧 Add Gemini for AI
              </span>
            )}
            <span className="text-xs bg-gray-50 px-2 py-1 rounded-full border border-gray-200">
              Press Enter to send
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HelpAssistant