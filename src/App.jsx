import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles, Wifi, WifiOff, AlertTriangle, Smartphone, Zap } from 'lucide-react'
import ObjectDetector from './components/ObjectDetector'
import ARCanvas from './components/ARCanvas'
import HelpAssistant from './components/HelpAssistant'
import MobileProblemSelector from './components/MobileProblemSelector'
import { healthAPI, deviceAPI, utils, errorHandler } from './services/api'
import { voiceGuidance } from './utils/voiceGuidance'
import BrowserCheck from './components/BrowserCheck';

export default function App() {
  // Detection and AR state
  const [detectedObject, setDetectedObject] = useState(null)
  const [showAR, setShowAR] = useState(false)
  const [showProblemSelector, setShowProblemSelector] = useState(false)
  const [startDetection, setStartDetection] = useState(false)
  const [instructions, setInstructions] = useState(null)
  const [selectedProblem, setSelectedProblem] = useState(null)
  
  // Loading and error states
  const [isLoadingInstructions, setIsLoadingInstructions] = useState(false)
  const [backendStatus, setBackendStatus] = useState('checking')
  const [error, setError] = useState(null)
  const [debugInfo, setDebugInfo] = useState(null)

  // Check backend connection on mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch('http://localhost:3001/health');
        const data = await response.json();
        console.log('Backend health check:', data);
        
        const isOnline = await utils.isBackendOnline()
        console.log('Utils health check:', isOnline);
        setBackendStatus(isOnline ? 'online' : 'offline')
      } catch (error) {
        console.error('Backend connection error:', error);
        setBackendStatus('offline')
      }
    }

    checkBackend()
    const interval = setInterval(checkBackend, 30000)
    return () => clearInterval(interval)
  }, [])

  // Handle mobile phone detection with enhanced feedback
  const handleObjectDetection = async (detectionResult) => {
    console.log('📱 Enhanced mobile phone detected:', detectionResult)
    setDetectedObject(detectionResult)
    
    // Enhanced voice feedback for phone detection
    if (detectionResult.deviceType === 'mobile_phone') {
      voiceGuidance.speak("Mobile phone detected successfully! Now please select the problem you're experiencing.")
      setShowProblemSelector(true)
      setStartDetection(false)
    }
  }

  // Handle problem selection with enhanced AR setup
  // In App.jsx, update the handleProblemSelected function:

const handleProblemSelected = async (problemId) => {
  console.log('🎯 Problem selected for enhanced AR:', problemId)
  setSelectedProblem(problemId)
  setIsLoadingInstructions(true)
  setError(null)

  try {
    // Enhanced voice introduction for the selected problem
    await voiceGuidance.speakProblemIntroduction(problemId)

    // Call backend to get instructions for the specific problem
    const response = await fetch('http://localhost:3001/api/phone-problem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ problem: problemId })
    });

    const instructionData = await response.json();
    
    if (instructionData.success) {
      // Fix: Ensure proper step formatting
      const formattedInstructions = {
        totalSteps: instructionData.total_steps,
        estimatedTime: instructionData.estimated_time,
        problemType: problemId,
        steps: instructionData.steps.map((step, index) => ({
          id: step.step || (index + 1), // Fix: Ensure step ID exists
          step: step.step || (index + 1), // Fix: Ensure step number exists
          title: step.title || `Step ${index + 1}`,
          description: step.description || 'Follow the AR instructions',
          position: step.position || [0, 0, -1],
          asset: step.asset,
          voiceover: step.voiceover || step.description || step.title,
          highlight: step.highlight,
          duration: step.duration || 8000,
          isCompleted: false,
          isActive: index === 0,
          componentTarget: getComponentFromStep(step)
        }))
      };
      
      console.log('✅ Formatted instructions:', formattedInstructions);
      
      setInstructions(formattedInstructions)
      setShowProblemSelector(false)
      setShowAR(true)

      // Enhanced voice guidance for AR mode
      setTimeout(() => {
        voiceGuidance.speak("AR mode activated! Follow the 3D instructions to fix your phone.")
      }, 2000)
    } else {
      throw new Error(instructionData.error || 'Failed to load instructions');
    }
  } catch (error) {
    console.error('Failed to load enhanced problem instructions:', error)
    setError('Failed to load AR instructions. Please try again.')
    voiceGuidance.speak("Sorry, there was an error loading the instructions. Please try again.")
  } finally {
    setIsLoadingInstructions(false)
  }
}

  // Enhanced component detection from step
  const getComponentFromStep = (step) => {
    const stepTitle = step.title.toLowerCase()
    
    if (stepTitle.includes('battery')) return 'battery'
    if (stepTitle.includes('restart') || stepTitle.includes('power')) return 'power_button'
    if (stepTitle.includes('app') || stepTitle.includes('close')) return 'apps'
    if (stepTitle.includes('settings')) return 'settings'
    if (stepTitle.includes('storage') || stepTitle.includes('cache')) return 'storage'
    if (stepTitle.includes('wifi') || stepTitle.includes('network')) return 'wifi'
    if (stepTitle.includes('cool') || stepTitle.includes('heat')) return 'cooling'
    
    return 'screen' // default
  }

  const handleDetectionError = (error) => {
    console.error('Detection error:', error)
    setError(typeof error === 'string' ? error : 'Detection failed. Please try again.')
    voiceGuidance.speak("Detection failed. Please ensure your phone is clearly visible and try again.")
  }

  const resetToScanning = () => {
    voiceGuidance.stop() // Stop any ongoing voice guidance
    setShowAR(false)
    setShowProblemSelector(false)
    setDetectedObject(null)
    setInstructions(null)
    setSelectedProblem(null)
    setStartDetection(false)
    setError(null)
  }

  const startNewDetection = () => {
    resetToScanning()
    setStartDetection(true)
    voiceGuidance.speak("Starting new phone detection. Please point your camera at your mobile phone.")
  }

  // Enhanced step completion handler
  // In App.jsx, update the step completion handlers:

const handleStepComplete = (stepId) => {
  console.log('✅ Enhanced step completed:', stepId)
  
  // Trigger celebration sound if available
  if (typeof Audio !== 'undefined') {
    try {
      // You can add a success sound here
      console.log('🎵 Step completion sound would play here');
    } catch (error) {
      console.log('Sound not available');
    }
  }
}

const handleInstructionComplete = () => {
  console.log('🎉 All enhanced troubleshooting steps completed!')
  
  // Show success notification
  if (Notification && Notification.permission === 'granted') {
    new Notification('Phone Fixed!', {
      body: `${selectedProblem?.replace('_', ' ')} troubleshooting completed successfully!`,
      icon: '/phone-icon.png' // Add if you have an icon
    });
  }
  
  // Analytics tracking (if implemented)
  if (typeof gtag !== 'undefined') {
    gtag('event', 'troubleshooting_completed', {
      problem_type: selectedProblem,
      total_steps: instructions?.totalSteps || 0
    });
  }
}
  const getConnectionIndicator = () => {
    switch (backendStatus) {
      case 'online':
        return <Wifi className="w-4 h-4 text-green-500" />
      case 'offline':
        return <WifiOff className="w-4 h-4 text-red-500" />
      default:
        return <div className="w-4 h-4 rounded-full bg-gray-400 animate-pulse" />
    }
  }

  return (
    <BrowserCheck>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-100 via-[#fbe8d3] to-blue-50 relative">
      {/* Enhanced Problem Selector Screen */}
      {showProblemSelector && detectedObject && (
        <MobileProblemSelector 
          onProblemSelected={handleProblemSelected}
          detectedObject={detectedObject}
        />
      )}

      {/* Enhanced AR Mode */}
      {showAR && detectedObject && instructions && (
        <>
          <ARCanvas 
            detectedObject={detectedObject} 
            instructions={instructions}
            selectedProblem={selectedProblem}
            onStepComplete={handleStepComplete}
            onInstructionComplete={handleInstructionComplete}
          />
          
          {/* Enhanced AR Controls */}
          <div className="absolute top-4 right-4 z-50 space-y-2">
            <Button
              onClick={resetToScanning}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl px-4 py-2 shadow-lg transform hover:scale-105 transition-all"
            >
              ❌ Exit Enhanced AR
            </Button>
            
            <Button
              onClick={startNewDetection}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl px-4 py-2 shadow-lg block w-full transform hover:scale-105 transition-all"
            >
              🔄 Scan New Phone
            </Button>

            <Button
              onClick={() => voiceGuidance.setEnabled(!voiceGuidance.isEnabled)}
              className={`rounded-xl px-4 py-2 shadow-lg block w-full transform hover:scale-105 transition-all ${
                voiceGuidance.isEnabled 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700' 
                  : 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700'
              } text-white`}
            >
              🎙️ {voiceGuidance.isEnabled ? 'Voice ON' : 'Voice OFF'}
            </Button>
          </div>

          {/* Enhanced AR Info Panel */}
          <div className="absolute bottom-4 left-4 z-50 bg-gradient-to-r from-blue-900/95 to-purple-900/95 backdrop-blur rounded-xl p-4 shadow-2xl max-w-sm border border-blue-400/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">
                  {detectedObject.deviceModel}
                </h3>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-200 text-sm font-medium">Enhanced AR Active</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <p className="text-blue-200">
                <strong>Problem:</strong> {selectedProblem?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </p>
              <p className="text-blue-200">
                <strong>Progress:</strong> {instructions.totalSteps} steps • ~{Math.round(instructions.estimatedTime / 1000)}s
              </p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-300 text-xs">
                  Detection: {(detectedObject.confidence * 100).toFixed(1)}% • 3D AR Ready
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Enhanced Main Screen - Only show when not in AR or problem selection */}
      {!showAR && !showProblemSelector && (
        <>
          <header className="text-center mt-6 mb-6 z-10">
            <div className="flex items-center justify-center gap-2 mb-2">
              <h1 className="text-4xl font-bold text-blue-900 flex items-center gap-3">
                <Sparkles className="text-[#d29859]" />
                HoloHelp
                <div className="relative">
                  <Smartphone className="text-blue-600" />
                  <Zap className="absolute -top-1 -right-1 w-4 h-4 text-yellow-500 animate-pulse" />
                </div>
              </h1>
              <div className="flex items-center gap-1 text-sm">
                {getConnectionIndicator()}
                <span className={`text-xs ${backendStatus === 'online' ? 'text-green-600' : 'text-red-600'}`}>
                  {backendStatus === 'checking' ? 'Connecting...' : backendStatus}
                </span>
              </div>
            </div>
            <p className="text-blue-700 font-semibold">Enhanced AR Mobile Phone Diagnostics</p>
            <p className="text-sm text-gray-600 mt-2">📱 Point your camera at your mobile phone for 3D AR troubleshooting</p>
            
            {backendStatus === 'offline' && (
              <div className="mt-2 inline-flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-1 rounded-full text-sm">
                <AlertTriangle className="w-4 h-4" />
                Backend offline - Enhanced AR features require backend connection
              </div>
            )}
          </header>

          {error && (
            <div className="mx-6 mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 z-10">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">Error:</span>
              </div>
              <p className="mt-1">{error}</p>
              <Button
                onClick={() => setError(null)}
                className="mt-2 bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1"
              >
                Dismiss
              </Button>
            </div>
          )}

          <main className="flex-1 px-6 z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <Card className="rounded-2xl shadow-md bg-white/80 backdrop-blur border border-blue-200/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                        <Smartphone className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-xl font-bold text-blue-800">Enhanced Phone AR Scanner</h2>
                      <Zap className="w-5 h-5 text-yellow-500 animate-pulse" />
                    </div>
                    <p className="text-blue-700 mb-4">
                      Point your camera at your mobile phone to start 3D AR troubleshooting with voice guidance.
                    </p>

                    {!startDetection ? (
                      <div className="space-y-3">
                        <Button
                          className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 text-white rounded-xl px-6 py-3 font-semibold transform hover:scale-105 transition-all shadow-lg"
                          onClick={() => setStartDetection(true)}
                          disabled={backendStatus === 'offline'}
                        >
                          {backendStatus === 'offline' ? '🔧 Backend Required for Enhanced AR' : '🚀 Start Enhanced Phone AR Scanning'}
                        </Button>
                        
                        {backendStatus === 'offline' && (
                          <p className="text-sm text-gray-600 text-center">
                            Please start the backend server to use enhanced AR phone diagnostics.
                          </p>
                        )}

                        {backendStatus === 'online' && (
                          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-3">
                            <p className="text-sm text-green-700 text-center font-medium">
                              ✨ Enhanced AR Features Available: 3D Phone Models, Component Highlighting, Voice Guidance
                            </p>
                          </div>
                        )}
                      </div>
                    ) : isLoadingInstructions ? (
                      <div className="text-center py-8">
                        <div className="relative mb-4">
                          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
                          <Smartphone className="absolute inset-0 m-auto w-6 h-6 text-blue-600" />
                        </div>
                        <p className="text-blue-700 font-semibold">Loading Enhanced AR Instructions...</p>
                        <p className="text-sm text-gray-600 mt-2">
                          Problem: {selectedProblem?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                        <div className="mt-3 flex items-center justify-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    ) : (
                      <ObjectDetector
                        onDetect={handleObjectDetection}
                        onDebug={setDebugInfo}
                        onError={handleDetectionError}
                      />
                    )}

                    {process.env.NODE_ENV === 'development' && debugInfo && (
                      <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs">
                        <strong>Debug Info:</strong>
                        <pre className="mt-1 overflow-auto max-h-32">
                          {JSON.stringify(debugInfo, null, 2)}
                        </pre>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card className="rounded-2xl shadow-md bg-white/80 backdrop-blur border border-orange-200/50">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold text-[#a76b30] mb-4 flex items-center gap-2">
                      🎙️ AI Assistant
                      <span className="text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Enhanced</span>
                    </h2>
                    <p className="text-blue-700 mb-4">
                      Get AI-powered phone troubleshooting advice with enhanced context awareness.
                    </p>
                    <HelpAssistant 
                      detectedDevice={detectedObject}
                      context={showAR ? 'ENHANCED_AR_MODE' : 'ENHANCED_PHONE_SCANNING_MODE'}
                      selectedProblem={selectedProblem}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>

            {backendStatus === 'online' && (
              <div className="mt-8 text-center">
                <div className="inline-flex items-center gap-4 bg-gradient-to-r from-green-50 to-blue-50 backdrop-blur rounded-xl px-6 py-3 text-sm border border-green-200">
                  <span className="flex items-center gap-2">
                    ✅ <strong>Backend Connected</strong>
                  </span>
                  <span className="flex items-center gap-2">
                    📱 <strong>Enhanced Phone Detection Ready</strong>
                  </span>
                  <span className="flex items-center gap-2">
                    🎯 <strong>3D AR Troubleshooting Available</strong>
                  </span>
                  <span className="flex items-center gap-2">
                    🎙️ <strong>Voice Guidance Active</strong>
                  </span>
                </div>
              </div>
            )}
          </main>

          <footer className="text-center py-6 text-sm text-blue-600 z-10">
            © 2025 HoloHelp – Enhanced AR Mobile Phone Diagnostics Expert 🚀📱
          </footer>
        </>
      )}
    </div>
    </BrowserCheck>
    
  )
}