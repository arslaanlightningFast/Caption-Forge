'use client'

import React, { useRef, useEffect, useState } from 'react'
import { useEditorStore } from '@/lib/store'
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatTime } from '@/lib/utils'

export function VideoPreview() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const videoContainerRef = useRef<HTMLDivElement>(null)
  const { project, currentTime, isPlaying, setCurrentTime, setIsPlaying, updateStyle } = useEditorStore()
  const [duration, setDuration] = useState(0)
  const [muted, setMuted] = useState(false)
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9' | '1:1' | '4:5'>('9:16')

  // Find active caption based on current time
  const activeCaption = project?.captions.find(
    c => currentTime >= c.start && currentTime <= c.end
  )

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => setIsPlaying(false))
      } else {
        videoRef.current.pause()
      }
    }
  }, [isPlaying])

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  // Calculate aspect ratio container style
  const getAspectStyle = () => {
    switch (aspectRatio) {
      case '9:16': return 'aspect-[9/16] max-h-[550px]'
      case '16:9': return 'aspect-[16/9] w-full max-h-[500px]'
      case '1:1': return 'aspect-square max-h-[500px]'
      case '4:5': return 'aspect-[4/5] max-h-[550px]'
      default: return 'aspect-[9/16] max-h-[550px]'
    }
  }

  if (!project) return <div className="flex items-center justify-center h-full text-gray-400">No project loaded</div>

  const style = project.style

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 select-none bg-[#0a0f0d]">
      {/* Aspect Ratio Selector Toolbar */}
      <div className="flex items-center gap-2 mb-4 bg-[#141c18]/80 backdrop-blur-xl border border-white/10 rounded-xl p-1 shadow-lg">
        {(['9:16', '16:9', '1:1', '4:5'] as const).map(ratio => (
          <button
            key={ratio}
            onClick={() => setAspectRatio(ratio)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              aspectRatio === ratio
                ? 'bg-lime-400 text-black font-bold shadow-md shadow-lime-400/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {ratio}
          </button>
        ))}
      </div>

      {/* Video Container with Dynamic Aspect Ratio */}
      <div
        ref={videoContainerRef}
        className={`relative bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex items-center justify-center ${getAspectStyle()}`}
      >
        <video
          ref={videoRef}
          src={project.videoUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          className="w-full h-full object-contain"
          playsInline
          muted={muted}
        />

        {/* Live Subtitle Overlay */}
        {activeCaption && (() => {
          const words = activeCaption.words && activeCaption.words.length > 0
            ? activeCaption.words
            : activeCaption.text.split(/\s+/).map((w, i, arr) => {
                const segDuration = activeCaption.end - activeCaption.start
                const wordDur = segDuration / arr.length
                return {
                  text: w,
                  start: activeCaption.start + i * wordDur,
                  end: activeCaption.start + (i + 1) * wordDur
                }
              })

          const posX = style.positionX ?? 50
          const posY = style.positionY ?? (style.position === 'top' ? 15 : style.position === 'center' ? 50 : 80)

          const handleMouseDown = (e: React.MouseEvent) => {
            if (!videoContainerRef.current) return
            const rect = videoContainerRef.current.getBoundingClientRect()

            const handleMouseMove = (moveEvent: MouseEvent) => {
              const x = moveEvent.clientX - rect.left
              const y = moveEvent.clientY - rect.top
              const xPct = Math.max(10, Math.min(90, (x / rect.width) * 100))
              const yPct = Math.max(5, Math.min(95, (y / rect.height) * 100))
              updateStyle({
                positionX: Math.round(xPct),
                positionY: Math.round(yPct)
              })
            }

            const handleMouseUp = () => {
              window.removeEventListener('mousemove', handleMouseMove)
              window.removeEventListener('mouseup', handleMouseUp)
            }

            window.addEventListener('mousemove', handleMouseMove)
            window.addEventListener('mouseup', handleMouseUp)
          }

          return (
            <div
              className="absolute pointer-events-auto cursor-grab active:cursor-grabbing z-10 transition-all duration-75 group"
              style={{
                left: `${posX}%`,
                top: `${posY}%`,
                transform: 'translate(-50%, -50%)',
              }}
              onMouseDown={handleMouseDown}
            >
              <div
                style={{
                  fontFamily: style.fontFamily,
                  fontSize: `${style.fontSize * 0.75}px`,
                  fontWeight: style.fontWeight,
                  color: style.textColor,
                  backgroundColor: style.backgroundColor !== 'transparent' ? style.backgroundColor : undefined,
                  opacity: style.backgroundOpacity > 0 ? 1 : undefined,
                  WebkitTextStroke: style.outlineWidth > 0 ? `${style.outlineWidth}px ${style.outlineColor}` : undefined,
                  textShadow: style.shadowBlur > 0 ? `${style.shadowX}px ${style.shadowY}px ${style.shadowBlur}px ${style.shadowColor}` : undefined,
                  maxWidth: `${style.maxWidth}%`,
                  textAlign: style.alignment,
                  textTransform: style.uppercase ? 'uppercase' : 'none',
                }}
                className="px-4 py-2 rounded-xl leading-tight transition-all duration-150 relative group border border-dashed border-transparent hover:border-lime-400/60 shadow-2xl bg-black/50 backdrop-blur-sm"
                onWheel={(e) => {
                  e.preventDefault()
                  const newSize = Math.max(20, Math.min(90, style.fontSize + (e.deltaY < 0 ? 2 : -2)))
                  updateStyle({ fontSize: newSize })
                }}
              >
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-lime-400 text-black font-bold text-[10px] px-2.5 py-0.5 rounded-full shadow-lg pointer-events-none transition-opacity whitespace-nowrap z-30">
                  Drag anywhere • Scroll to resize ({style.fontSize}px)
                </div>

                <span>
                  {words.map((w, idx) => {
                    const isSpoken = currentTime >= w.start && currentTime <= w.end
                    return (
                      <span
                        key={idx}
                        style={{
                          color: isSpoken ? style.highlightColor : style.textColor,
                          transform: isSpoken ? 'scale(1.05)' : 'scale(1)',
                        }}
                        className="inline-block mx-1 transition-all duration-150"
                      >
                        {w.text}
                      </span>
                    )
                  })}
                </span>
              </div>
            </div>
          )
        })()}

        {/* Video Playback Controls Bar */}
        <div className="absolute bottom-3 inset-x-3 bg-[#141c18]/90 backdrop-blur-md rounded-xl p-2.5 flex items-center justify-between border border-white/10 z-20 shadow-xl">
          <div className="flex items-center gap-2">
            <Button size="icon" variant="ghost" onClick={togglePlay} className="h-8 w-8 text-white hover:bg-white/10 rounded-lg">
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-lime-400 fill-lime-400" />}
            </Button>
            <Button size="icon" variant="ghost" onClick={() => { if (videoRef.current) videoRef.current.currentTime = 0 }} className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg">
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
            <span className="text-xs font-mono text-gray-300 ml-2">
              {formatTime(currentTime)} / {formatTime(duration || project.duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button size="icon" variant="ghost" onClick={() => setMuted(!muted)} className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg">
              {muted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
