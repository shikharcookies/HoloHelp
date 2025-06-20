import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mic, SendHorizonal } from 'lucide-react'
import { getSmartResponse } from '@/utils/faqMatcher' // ✅ use external smart matcher

const HelpAssistant = () => {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi! Ask me anything about your device.' }
  ])
  const [input, setInput] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const recognitionRef = useRef(null)

  const handleSend = useCallback((messageText = input) => {
    if (!messageText.trim()) return

    const userMsg = messageText.trim()
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }])
    setInput('')

    const reply = getSmartResponse(userMsg) // ✅ use smart response
    setTimeout(() => {
      setMessages(prev => [...prev, { sender: 'bot', text: reply }])
    }, 500)
  }, [input])

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

      recognition.onerror = () => setIsRecording(false)
      recognition.onend = () => setIsRecording(false)

      recognitionRef.current = recognition
    }
  }, [handleSend])

  const handleMicClick = () => {
    if (isRecording) recognitionRef.current?.stop()
    else {
      setIsRecording(true)
      recognitionRef.current?.start()
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto my-10 p-4 bg-white/80 rounded-xl shadow-lg backdrop-blur-md">
      <div className="h-64 overflow-y-auto border border-blue-200 rounded-lg p-3 mb-4 bg-white/60">
        {messages.map((msg, idx) => (
          <div key={idx} className={`mb-2 text-sm ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
            <span
              className={`inline-block px-3 py-2 rounded-lg ${
                msg.sender === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-[#fbe8d3] text-blue-900'
              }`}
            >
              {msg.text}
            </span>
          </div>
        ))}
      </div>

      <div className="flex gap-2 items-center">
        <Input
          className="flex-1 rounded-xl"
          placeholder="Ask your question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <Button
          className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => handleSend()}
        >
          <SendHorizonal className="w-4 h-4" />
        </Button>
        <Button
          onClick={handleMicClick}
          className={`rounded-xl ${isRecording ? 'bg-red-600' : 'bg-[#d29859] hover:bg-[#bb7f3f]'} text-white`}
        >
          <Mic className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

export default HelpAssistant
