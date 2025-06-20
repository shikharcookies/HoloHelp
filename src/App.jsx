import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'
import ObjectDetector from './components/ObjectDetector'
import ARCanvas from './components/ARCanvas'
import HelpAssistant from './components/HelpAssistant'


export default function App() {
  const [detectedObject, setDetectedObject] = useState(null)
  const [showAR, setShowAR] = useState(false)
  const [startDetection, setStartDetection] = useState(false)

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-100 via-[#fbe8d3] to-blue-50 relative">
      <header className="text-center mt-6 mb-10 z-10">
        <h1 className="text-4xl font-bold text-blue-900">
          <Sparkles className="inline-block mr-2 text-[#d29859]" />
          HoloHelp
        </h1>
        <p className="text-blue-700 mt-2">AR-powered customer support assistant</p>
      </header>

      {!showAR && (
        <main className="flex-1 px-6 z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Card className="rounded-2xl shadow-md bg-white/80 backdrop-blur">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-blue-800 mb-4">📷 Scan & Recognize</h2>
                  <p className="text-blue-700 mb-4">Point your camera at a device to detect and begin AR instructions.</p>

                  {!startDetection ? (
                    <Button
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 py-2"
                      onClick={() => setStartDetection(true)}
                    >
                      Start Scanning
                    </Button>
                  ) : !detectedObject ? (
                    <ObjectDetector
                      onDetect={(label) => {
                        setDetectedObject(label)
                        setShowAR(true)
                        setStartDetection(false)
                      }}
                    />
                  ) : (
                    <ThreeARCanvas />
                  )}
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="rounded-2xl shadow-md bg-white/80 backdrop-blur">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-[#a76b30] mb-4">🎙️ Ask for Help</h2>
                  <p className="text-blue-700 mb-4">Use voice or type your query to get instructions.</p>
                  <HelpAssistant />
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      )}

      {showAR && detectedObject && (
        <>
          <ARCanvas detectedObject={detectedObject} />
          <div className="absolute top-4 right-4 z-50">
            <Button
              onClick={() => {
                setShowAR(false)
                setDetectedObject(null)
              }}
              className="bg-red-500 text-white rounded-xl px-4 py-2"
            >
              ❌ Stop AR
            </Button>
          </div>
        </>
      )}

      <footer className="text-center py-6 text-sm text-blue-600 z-10">
        © 2025 HoloHelp – Built for hackathons & beyond 🚀
      </footer>
    </div>
  )
}

