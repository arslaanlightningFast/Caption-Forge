import React from 'react'
import { Sparkles } from 'lucide-react'

interface LogoProps {
  className?: string
  size?: number
}

export function Logo({ className = "w-9 h-9", size = 20 }: LogoProps) {
  return (
    <div className={`relative flex items-center justify-center bg-gradient-to-tr from-lime-400 to-emerald-400 rounded-2xl shadow-lg shadow-lime-400/25 ${className}`}>
      {/* Inner geometric caption / play motif */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-lime-500/20 to-transparent backdrop-blur-sm pointer-events-none" />
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-black relative z-10"
      >
        {/* Play triangle combined with caption bars */}
        <path
          d="M6 4.5V19.5L18.5 12L6 4.5Z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* Sound/Caption wave accent */}
        <circle cx="19" cy="12" r="2" fill="currentColor" />
      </svg>
    </div>
  )
}
