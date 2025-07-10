import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Smartphone, Zap } from 'lucide-react'

const MobileProblemSelector = ({ onProblemSelected, detectedObject }) => {
  const [selectedProblem, setSelectedProblem] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const problems = [
    {
      id: 'battery_drain',
      title: 'Battery Drains Fast',
      description: 'Phone battery dies quickly or won\'t hold charge',
      color: 'bg-gradient-to-br from-red-500 to-red-600',
      emoji: '🔋',
      severity: 'high',
      estimatedTime: '5-8 minutes'
    },
    {
      id: 'slow_performance', 
      title: 'Phone is Slow/Laggy',
      description: 'Apps take long to open, phone freezes or stutters',
      color: 'bg-gradient-to-br from-orange-500 to-orange-600',
      emoji: '⚡',
      severity: 'medium',
      estimatedTime: '4-6 minutes'
    },
    {
      id: 'overheating',
      title: 'Phone Gets Too Hot', 
      description: 'Device becomes uncomfortably warm during use',
      color: 'bg-gradient-to-br from-red-600 to-pink-600',
      emoji: '🌡️',
      severity: 'high',
      estimatedTime: '3-5 minutes'
    },
    {
      id: 'wifi_issues',
      title: 'WiFi Problems',
      description: 'Can\'t connect to WiFi or connection keeps dropping',
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      emoji: '📶',
      severity: 'medium',
      estimatedTime: '6-10 minutes'
    },
    {
      id: 'storage_full',
      title: 'Storage Space Full',
      description: 'Can\'t install apps or take photos due to low storage',
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      emoji: '💾',
      severity: 'low',
      estimatedTime: '4-7 minutes'
    }
  ]

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-400 bg-red-900/30 border-red-500/50'
      case 'medium': return 'text-yellow-400 bg-yellow-900/30 border-yellow-500/50'
      case 'low': return 'text-green-400 bg-green-900/30 border-green-500/50'
      default: return 'text-gray-400 bg-gray-900/30 border-gray-500/50'
    }
  }

  const handleProblemSelect = (problemId) => {
    setSelectedProblem(problemId)
  }

  const handleConfirmProblem = async () => {
    if (selectedProblem && onProblemSelected) {
      setIsLoading(true)
      
      // Add loading delay for better UX
      setTimeout(() => {
        onProblemSelected(selectedProblem)
      }, 1500)
    }
  }

  // Auto-speak introduction
  useEffect(() => {
    const speakIntroduction = () => {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(
          `Mobile phone detected! I can help you troubleshoot common phone issues with step-by-step AR guidance. Please select the problem you're experiencing.`
        )
        utterance.rate = 0.9
        utterance.pitch = 1.1
        speechSynthesis.speak(utterance)
      }
    }
    
    // Delay to ensure component is mounted
    setTimeout(speakIntroduction, 1000)
  }, [])

  if (isLoading) {
    return (
      <div className="relative w-full h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black flex items-center justify-center p-6">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Smartphone className="w-16 h-16 text-white" />
            </div>
            <div className="absolute inset-0 w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto animate-ping opacity-20"></div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Initializing AR Diagnostics</h2>
          <p className="text-blue-200 mb-6">
            Preparing {problems.find(p => p.id === selectedProblem)?.title} troubleshooting steps...
          </p>
          <div className="flex items-center justify-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black flex items-center justify-center p-6 overflow-y-auto">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/10 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-purple-500/10 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-32 left-40 w-40 h-40 bg-pink-500/10 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 max-w-6xl w-full">
        {/* Enhanced Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="relative">
              <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                <Smartphone className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-bold text-white mb-2">Mobile Phone Detected!</h1>
              <p className="text-blue-200">AR-Powered Diagnostic Assistant</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl animate-bounce">
              <Zap className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-900/60 to-purple-900/60 backdrop-blur-md rounded-2xl p-6 border border-blue-400/30 mb-8">
            <p className="text-xl text-blue-100 mb-3">
              🎯 I can help you fix common phone problems with step-by-step AR guidance
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-blue-200">
              <span className="flex items-center gap-2">
                📱 Device: {detectedObject?.deviceModel || 'Mobile Phone'}
              </span>
              <span className="flex items-center gap-2">
                🎯 Confidence: {(detectedObject?.confidence * 100).toFixed(1)}%
              </span>
              <span className="flex items-center gap-2">
                ✨ AR Ready
              </span>
            </div>
          </div>
        </div>

        {/* Enhanced Problem Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {problems.map((problem) => (
            <Card 
              key={problem.id}
              className={`cursor-pointer transition-all duration-300 transform hover:scale-105 border-2 ${
                selectedProblem === problem.id 
                  ? 'border-white shadow-2xl bg-white/20 scale-105' 
                  : 'border-white/20 hover:border-white/40 bg-white/10'
              } backdrop-blur-md rounded-2xl overflow-hidden`}
              onClick={() => handleProblemSelect(problem.id)}
            >
              <CardContent className="p-6 text-center relative">
                {/* Problem Icon */}
                <div className={`${problem.color} w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg relative overflow-hidden`}>
                  <span className="text-3xl z-10">{problem.emoji}</span>
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
                
                {/* Problem Details */}
                <h3 className="text-xl font-bold text-white mb-3">
                  {problem.title}
                </h3>
                <p className="text-sm text-blue-100 mb-4 leading-relaxed">
                  {problem.description}
                </p>
                
                {/* Problem Metadata */}
                <div className="space-y-2 mb-4">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(problem.severity)}`}>
                    <span className="w-2 h-2 rounded-full bg-current"></span>
                    {problem.severity.toUpperCase()} PRIORITY
                  </div>
                  <div className="text-xs text-blue-300">
                    ⏱️ Estimated fix time: {problem.estimatedTime}
                  </div>
                </div>
                
                {/* Selection Indicator */}
                {selectedProblem === problem.id && (
                  <div className="mt-4 p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400 rounded-xl animate-pulse">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-green-200 text-sm font-bold">✓ SELECTED</span>
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                    </div>
                  </div>
                )}
                
                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enhanced Action Section */}
        <div className="text-center">
          {selectedProblem ? (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-900/60 to-emerald-900/60 backdrop-blur-md rounded-2xl p-6 border border-green-400/30 max-w-2xl mx-auto">
                <h3 className="text-white font-bold text-xl mb-2">Ready to Fix Your Phone!</h3>
                <p className="text-green-200 mb-3">
                  Selected: <strong>{problems.find(p => p.id === selectedProblem)?.title}</strong>
                </p>
                <p className="text-sm text-green-300">
                  I'll guide you through {problems.find(p => p.id === selectedProblem)?.estimatedTime} of step-by-step AR instructions
                </p>
              </div>
              
              <Button
                onClick={handleConfirmProblem}
                className="bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 hover:from-green-700 hover:via-emerald-700 hover:to-green-800 text-white px-12 py-4 rounded-2xl text-lg font-bold shadow-2xl transform hover:scale-105 transition-all duration-300 border border-green-400/50"
              >
                <div className="flex items-center gap-3">
                  <Zap className="w-6 h-6" />
                  Start AR Troubleshooting
                  <span className="text-2xl">→</span>
                </div>
              </Button>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-blue-900/60 to-purple-900/60 backdrop-blur-md rounded-2xl p-6 border border-blue-400/30 max-w-2xl mx-auto">
              <p className="text-blue-200 text-lg flex items-center justify-center gap-3">
                <span className="text-2xl animate-bounce">👆</span>
                Select the problem you're experiencing with your phone
                <span className="text-2xl animate-bounce" style={{ animationDelay: '0.5s' }}>👆</span>
              </p>
            </div>
          )}
        </div>

        {/* Help Information */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 backdrop-blur-md rounded-2xl p-6 max-w-4xl mx-auto border border-purple-400/30">
            <h4 className="text-white font-bold text-lg mb-4 flex items-center justify-center gap-2">
              <span className="text-2xl">💡</span>
              How Phone AR Diagnostics Works
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-blue-200">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl">1️⃣</span>
                </div>
                <p><strong>Select Problem</strong><br />Choose your phone issue from above</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl">2️⃣</span>
                </div>
                <p><strong>Follow AR Steps</strong><br />3D instructions guide you through fixes</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl">3️⃣</span>
                </div>
                <p><strong>Voice Guidance</strong><br />Audio instructions for each step</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MobileProblemSelector