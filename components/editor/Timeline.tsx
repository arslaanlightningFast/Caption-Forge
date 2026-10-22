'use client'

import React from 'react'
import { useEditorStore } from '@/lib/store'
import { formatTime } from '@/lib/utils'

export function Timeline() {
  const { project, currentTime, setCurrentTime, selectedCaptionId, setSelectedCaptionId } = useEditorStore()

  if (!project) return null

  const duration = project.duration || 30 // fallback duration if not loaded

  return (
    <div className="h-32 bg-[#0d1210] border-t border-white/10 flex flex-col p-3 select-none">
      {/* Time ruler / indicator */}
      <div className="flex items-center justify-between text-xs text-gray-400 mb-2 font-mono px-1">
        <span>{formatTime(currentTime)}</span>
        <span>Duration: {formatTime(duration)}</span>
      </div>

      {/* Timeline Track */}
      <div
        className="relative flex-1 bg-[#141c18] rounded-xl border border-white/10 overflow-x-auto overflow-y-hidden cursor-pointer shadow-inner"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const clickX = e.clientX - rect.left
          const width = rect.width
          const newTime = (clickX / width) * duration
          setCurrentTime(Math.max(0, Math.min(duration, newTime)))
        }}
      >
        {/* Playhead Indicator Line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-lime-400 z-20 pointer-events-none shadow-[0_0_10px_#ccff00]"
          style={{ left: `${(currentTime / duration) * 100}%` }}
        >
          <div className="w-3 h-3 bg-lime-400 rounded-full -ml-[5px] -mt-1 shadow-md" />
        </div>

        {/* Caption Blocks */}
        <div className="absolute inset-y-0 inset-x-0 flex items-center px-2 gap-1">
          {project.captions.map((cap) => {
            const leftPct = (cap.start / duration) * 100
            const widthPct = Math.max(2, ((cap.end - cap.start) / duration) * 100)
            const isSelected = selectedCaptionId === cap.id

            return (
              <div
                key={cap.id}
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedCaptionId(cap.id)
                  setCurrentTime(cap.start)
                }}
                style={{
                  left: `${leftPct}%`,
                  width: `${widthPct}%`,
                }}
                className={`absolute h-16 top-2 rounded-xl p-2 border text-xs overflow-hidden flex flex-col justify-between transition-all backdrop-blur-md ${
                  isSelected
                    ? 'bg-lime-400/20 border-lime-400 text-white shadow-lg shadow-lime-400/10'
                    : 'bg-[#1c2822]/80 border-white/10 text-gray-300 hover:bg-[#1c2822]'
                }`}
              >
                <div className="font-mono text-[10px] text-gray-400 truncate">
                  {formatTime(cap.start)}
                </div>
                <div className="truncate font-medium text-gray-100">
                  {cap.text}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
