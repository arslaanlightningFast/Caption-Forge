"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

export interface ColorPickerProps {
  value: string
  onChange: (value: string) => void
  presets?: string[]
  className?: string
}

const DEFAULT_PRESETS = [
  "#ffffff",
  "#000000",
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
]

const ColorPicker = React.forwardRef<HTMLDivElement, ColorPickerProps>(
  ({ value, onChange, presets = DEFAULT_PRESETS, className }, ref) => {
    return (
      <div ref={ref} className={cn("space-y-3", className)}>
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-gray-700 bg-gray-900 shrink-0">
            <input
              type="color"
              value={value || "#ffffff"}
              onChange={(e) => onChange(e.target.value)}
              className="absolute -inset-2 h-14 w-14 cursor-pointer border-0 p-0"
            />
          </div>
          <Input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#000000"
            className="font-mono uppercase"
          />
        </div>
        {presets && presets.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {presets.map((preset) => (
              <button
                key={preset}
                type="button"
                className={cn(
                  "h-6 w-6 rounded-md border border-gray-700 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950",
                  value?.toLowerCase() === preset.toLowerCase() &&
                    "ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-950"
                )}
                style={{ backgroundColor: preset }}
                onClick={() => onChange(preset)}
                title={preset}
              />
            ))}
          </div>
        )}
      </div>
    )
  }
)
ColorPicker.displayName = "ColorPicker"

export { ColorPicker }
