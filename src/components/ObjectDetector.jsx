import { useEffect, useRef, useState } from 'react'
import * as cocoSsd from '@tensorflow-models/coco-ssd'
import '@tensorflow/tfjs'
import { deviceAPI, errorHandler } from '@/services/api'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle, Loader2, Camera } from 'lucide-react'

const confidenceThreshold = 0.4 // Lower for better detection
const detectionCooldown = 4000 // 4 seconds between backend calls

const ObjectDetector = ({ onDetect, onDebug, onError }) => {
  const videoRef = useRef(null)
  const wrapperRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [modelLoaded, setModelLoaded] = useState(false)
  const [detectionState, setDetectionState] = useState('scanning') // scanning, processing, success
  const [lastDetection, setLastDetection] = useState(null)
  const [statusMessage, setStatusMessage] = useState('Initializing camera...')
  const [continuousDetections, setContinuousDetections] = useState([])
  const lastBackendCall = useRef(0)
  const detectionHistory = useRef([])

  useEffect(() => {
    let model = null
    let animationFrameId = null
    let stream = null

    const video = videoRef.current

    const setupCamera = async () => {
      try {
        setStatusMessage('Requesting camera access...')
        stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false,
        })
        
        if (video) {
          video.srcObject = stream
          await video.play()
          setStatusMessage('Camera ready! Loading AI model...')
        }
      } catch (error) {
        console.error('Camera setup error:', error)
        setStatusMessage('Camera access denied. Please allow camera permissions and refresh.')
        if (onError) onError('Camera access denied')
      }
    }

    const detectFrame = async () => {
      if (video && model && video.readyState === 4) {
        try {
          const predictions = await model.detect(video)
          clearBoxes()

          const detectedObjects = []
          const debugData = []

          predictions.forEach(pred => {
            const { class: label, score, bbox } = pred
            if (score >= confidenceThreshold) {
              detectedObjects.push(label)
              drawBox(bbox, `${label} (${(score * 100).toFixed(1)}%)`, score)
              debugData.push({ label, score: score.toFixed(2), bbox })
            }
          })

          if (onDebug) onDebug(debugData)

          // Track detection history for stability
          detectionHistory.current.push(detectedObjects)
          if (detectionHistory.current.length > 10) {
            detectionHistory.current.shift() // Keep last 10 detections
          }

          // Update continuous detections display
          setContinuousDetections(detectedObjects)

          // Only call backend if we have consistent detections
          if (detectedObjects.length > 0) {
            const now = Date.now()
            if (now - lastBackendCall.current > detectionCooldown) {
              
              // Check for consistent detection over multiple frames
              const recentDetections = detectionHistory.current.slice(-5) // Last 5 frames
              const consistentObjects = findConsistentObjects(recentDetections)
              
              if (consistentObjects.length > 0) {
                lastBackendCall.current = now
                await handleDetection(consistentObjects)
              } else {
                setStatusMessage(`Detecting: ${detectedObjects.join(', ')}... Hold steady for better recognition.`)
                setDetectionState('scanning')
              }
            }
          } else {
            setStatusMessage('Point camera at any object - phone, book, bottle, laptop...')
            setDetectionState('scanning')
          }

        } catch (error) {
          console.error('Detection error:', error)
          setStatusMessage('Detection running... Keep camera steady.')
          // Don't change detection state on errors - keep scanning
        }
      }

      // CRITICAL: Always continue the animation loop
      animationFrameId = requestAnimationFrame(detectFrame)
    }

    // Find objects that appear consistently across multiple frames
    const findConsistentObjects = (recentDetections) => {
      if (recentDetections.length < 3) return []
      
      const objectCounts = {}
      recentDetections.forEach(detection => {
        detection.forEach(obj => {
          objectCounts[obj] = (objectCounts[obj] || 0) + 1
        })
      })
      
      // Return objects that appear in at least 60% of recent frames
      const threshold = Math.ceil(recentDetections.length * 0.6)
      return Object.keys(objectCounts).filter(obj => objectCounts[obj] >= threshold)
    }

    const handleDetection = async (detectedObjects) => {
      setDetectionState('processing')
      setStatusMessage('Analyzing objects...')

      try {
        // Enhanced object filtering and mapping
        const supportedMappings = {
          // Electronics -> Router
          'cell phone': 'router', 'phone': 'router', 'smartphone': 'router',
          'laptop': 'router', 'computer': 'router', 'tablet': 'router',
          'tv': 'router', 'monitor': 'router', 'remote': 'router',
          
          // Kitchen/Appliances -> Microwave  
          'oven': 'microwave', 'microwave': 'microwave', 'toaster': 'microwave',
          'refrigerator': 'microwave', 'dishwasher': 'microwave',
          
          // Containers -> Water Filter
          'bottle': 'water_filter', 'cup': 'water_filter', 'mug': 'water_filter',
          'glass': 'water_filter', 'jar': 'water_filter',
          
          // Common objects for demo
          'book': 'microwave', 'mouse': 'router', 'keyboard': 'router',
          'clock': 'microwave', 'vase': 'water_filter'
        }

        const mappedObjects = detectedObjects
          .map(obj => supportedMappings[obj.toLowerCase()])
          .filter(Boolean)

        if (mappedObjects.length > 0) {
          const result = await deviceAPI.recognizeDevice(detectedObjects)
          
          if (result.success) {
            setDetectionState('success')
            setStatusMessage(`${result.device_model} detected! Opening AR guidance...`)
            setLastDetection(result)
            
            // Success! Open AR in new tab and keep camera running
            if (onDetect) {
              onDetect({
                deviceModel: result.device_model,
                deviceType: result.device_type,
                instructionSetId: result.instruction_set_id,
                confidence: result.confidence,
                detectedObjects: result.detected_objects
              })
            }
            
            // Reset to scanning after success (don't stop camera)
            setTimeout(() => {
              setDetectionState('scanning')
              setStatusMessage('Great! You can scan another object or ask the chatbot questions.')
            }, 3000)
          }
        } else {
          setDetectionState('scanning')
          setStatusMessage(`Detected: ${detectedObjects.join(', ')}. Try phone, laptop, book, or bottle.`)
        }

      } catch (error) {
        console.error('Backend recognition error:', error)
        // NEVER go to error state - always keep scanning
        setDetectionState('scanning')
        setStatusMessage('Recognition failed. Keep trying - camera stays active!')
      }
    }

    const clearBoxes = () => {
      const boxLayer = wrapperRef.current?.querySelectorAll('.bbox')
      boxLayer?.forEach(el => el.remove())
    }

    const drawBox = (bbox, label, confidence) => {
      if (!wrapperRef.current) return

      const [x, y, width, height] = bbox
      const box = document.createElement('div')
      
      // Color based on confidence and recognition status
      const color = confidence > 0.7 ? 'green' : confidence > 0.5 ? 'blue' : 'orange'
      
      box.className = 'bbox absolute border-2 rounded transition-all duration-200'
      box.style.left = `${x}px`
      box.style.top = `${y}px`
      box.style.width = `${width}px`
      box.style.height = `${height}px`
      box.style.borderColor = color === 'green' ? '#10b981' : color === 'blue' ? '#3b82f6' : '#f59e0b'
      box.style.backgroundColor = `rgba(${color === 'green' ? '16, 185, 129' : color === 'blue' ? '59, 130, 246' : '245, 158, 11'}, 0.1)`
      box.style.boxShadow = `0 0 8px rgba(${color === 'green' ? '16, 185, 129' : color === 'blue' ? '59, 130, 246' : '245, 158, 11'}, 0.5)`
      box.style.zIndex = 30

      const labelEl = document.createElement('span')
      labelEl.className = 'text-white text-xs px-2 py-1 rounded-br font-medium'
      labelEl.style.position = 'absolute'
      labelEl.style.top = '0'
      labelEl.style.left = '0'
      labelEl.style.backgroundColor = box.style.borderColor
      labelEl.innerText = label

      box.appendChild(labelEl)
      wrapperRef.current.appendChild(box)
    }

    const startDetection = async () => {
      try {
        setStatusMessage('Loading AI model...')
        model = await cocoSsd.load()
        setModelLoaded(true)
        setStatusMessage('AI ready! Point camera at any object...')
        setDetectionState('scanning')
        
        await setupCamera()
        setIsLoading(false)
        detectFrame() // Start the detection loop
      } catch (error) {
        console.error('Model loading error:', error)
        setStatusMessage('AI model failed to load. Please refresh the page.')
        setIsLoading(false)
        if (onError) onError('Model loading failed')
      }
    }

    startDetection()

    return () => {
      // Cleanup but don't stop camera abruptly
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
      if (video) {
        video.pause()
        video.srcObject = null
      }
      clearBoxes()
    }
  }, [onDetect, onDebug, onError])

  const getStatusIcon = () => {
    switch (detectionState) {
      case 'processing':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      default:
        return <Camera className="w-4 h-4 text-blue-500 animate-pulse" />
    }
  }

  const getStatusColor = () => {
    switch (detectionState) {
      case 'processing':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="w-full max-w-[640px] mx-auto">
      {/* Status Bar */}
      <div className={`mb-4 p-3 rounded-lg border ${getStatusColor()} transition-all duration-200`}>
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-sm font-medium">{statusMessage}</span>
        </div>
        
        {/* Live detection display */}
        {continuousDetections.length > 0 && (
          <div className="mt-2 text-xs">
            <strong>Live Detection:</strong> {continuousDetections.join(', ')}
          </div>
        )}
        
        {lastDetection && detectionState === 'success' && (
          <div className="mt-2 text-xs">
            <strong>Recognized:</strong> {lastDetection.device_model} 
            ({(lastDetection.confidence * 100).toFixed(1)}% confidence)
          </div>
        )}
      </div>

      {/* Camera Container */}
      <div 
        ref={wrapperRef} 
        className="relative w-full aspect-video rounded-lg overflow-hidden bg-black shadow-lg"
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/80">
            <div className="text-center text-white">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
              <p className="text-sm">Starting camera and AI...</p>
            </div>
          </div>
        )}
        
        <video
          ref={videoRef}
          className="absolute w-full h-full object-cover z-10"
          playsInline
          muted
        />

        {/* Camera never stops indicator */}
        <div className="absolute top-2 right-2 z-40 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            LIVE
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-3 text-xs text-gray-500 text-center">
        <p>📱 Try: Phone, Laptop, Book, Bottle, Cup</p>
        <p>💡 Tip: Hold object steady for 2-3 seconds</p>
        <p>🎯 Camera stays active - scan multiple objects!</p>
      </div>
    </div>
  )
}

export default ObjectDetector