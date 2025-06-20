import { useEffect, useRef } from 'react'
import * as cocoSsd from '@tensorflow-models/coco-ssd'
import '@tensorflow/tfjs'
import { labelMapping } from '@/data/labelMap.js'

const confidenceThreshold = 0.6

const ObjectDetector = ({ onDetect, onDebug }) => {
  const videoRef = useRef(null)
  const wrapperRef = useRef(null)

  useEffect(() => {
    let model = null
    let animationFrameId = null
    let stream = null

    const video = videoRef.current

    const setupCamera = async () => {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      })
      if (video) {
        video.srcObject = stream
        await video.play()
      }
    }

    const detectFrame = async () => {
      if (video && model) {
        const predictions = await model.detect(video)
        clearBoxes()

        let detectedLabel = null
        const debugData = []

        predictions.forEach(pred => {
          const { class: label, score, bbox } = pred
          if (score >= confidenceThreshold) {
            const mapped = labelMapping[label]
            if (mapped && !detectedLabel) detectedLabel = mapped

            drawBox(bbox, `${label} (${(score * 100).toFixed(1)}%)`)
            debugData.push({ label, mapped, score: score.toFixed(2), bbox })
          }
        })

        if (onDebug) onDebug(debugData)
        if (onDetect && detectedLabel) onDetect(detectedLabel)
      }

      animationFrameId = requestAnimationFrame(detectFrame)
    }

    const clearBoxes = () => {
      const boxLayer = wrapperRef.current.querySelectorAll('.bbox')
      boxLayer.forEach(el => el.remove())
    }

    const drawBox = (bbox, label) => {
      const [x, y, width, height] = bbox
      const box = document.createElement('div')
      box.className = 'bbox absolute border-2 border-blue-500 rounded'
      box.style.left = `${x}px`
      box.style.top = `${y}px`
      box.style.width = `${width}px`
      box.style.height = `${height}px`
      box.style.backgroundColor = 'rgba(0,0,255,0.1)'
      box.style.boxShadow = '0 0 6px rgba(0,0,255,0.5)'
      box.style.zIndex = 30

      const labelEl = document.createElement('span')
      labelEl.className = 'text-white text-xs bg-blue-500 px-1 rounded-br'
      labelEl.style.position = 'absolute'
      labelEl.style.top = '0'
      labelEl.style.left = '0'
      labelEl.innerText = label

      box.appendChild(labelEl)
      wrapperRef.current.appendChild(box)
    }

    const startDetection = async () => {
      model = await cocoSsd.load()
      await setupCamera()
      detectFrame()
    }

    startDetection()

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
      if (stream) stream.getTracks().forEach(track => track.stop())
      if (video) {
        video.pause()
        video.srcObject = null
      }
    }
  }, [onDetect, onDebug])

  return (
    <div ref={wrapperRef} className="relative w-full max-w-[640px] mx-auto aspect-video rounded overflow-hidden">
      <video
        ref={videoRef}
        className="absolute w-full h-full object-cover z-10"
        playsInline
        muted
      />
    </div>
  )
}

export default ObjectDetector
