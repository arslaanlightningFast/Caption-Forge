import { Caption, Word } from './types'
import { randomUUID } from 'crypto'

/**
 * Split a caption at a timestamp, reassigning words.
 */
export function splitCaption(caption: Caption, splitTime: number): [Caption, Caption] {
  if (splitTime <= caption.start || splitTime >= caption.end) {
    throw new Error('Split time must be between caption start and end time')
  }

  const words = caption.words || []
  let text1 = ''
  let text2 = ''
  let words1: Word[] = []
  let words2: Word[] = []

  if (words.length > 0) {
    words1 = words.filter(w => w.end <= splitTime)
    words2 = words.filter(w => w.start >= splitTime)
    // If words are split across splitTime, assign to nearest or divide
    if (words1.length === 0 && words2.length > 0) {
      words1 = [words2[0]]
      words2 = words2.slice(1)
    }
    text1 = words1.map(w => w.text).join(' ')
    text2 = words2.map(w => w.text).join(' ')
  } else {
    const mid = Math.floor(caption.text.length / 2)
    text1 = caption.text.slice(0, mid).trim()
    text2 = caption.text.slice(mid).trim()
  }

  const c1: Caption = {
    ...caption,
    text: text1 || caption.text,
    end: splitTime,
    words: words1.length > 0 ? words1 : undefined,
  }

  const c2: Caption = {
    id: randomUUID(),
    text: text2 || caption.text,
    start: splitTime,
    end: caption.end,
    words: words2.length > 0 ? words2 : undefined,
  }

  return [c1, c2]
}

/**
 * Merge two adjacent captions.
 */
export function mergeCaptions(a: Caption, b: Caption): Caption {
  const mergedWords = [...(a.words || []), ...(b.words || [])]
  return {
    id: a.id,
    text: `${a.text} ${b.text}`.trim(),
    start: Math.min(a.start, b.start),
    end: Math.max(a.end, b.end),
    words: mergedWords.length > 0 ? mergedWords : undefined,
  }
}

/**
 * Adjust timing of a caption, proportionally shifting words if present.
 */
export function adjustTiming(caption: Caption, newStart: number, newEnd: number): Caption {
  if (newStart >= newEnd) {
    throw new Error('Start time must be less than end time')
  }

  const oldDuration = caption.end - caption.start
  const newDuration = newEnd - newStart
  const ratio = oldDuration > 0 ? newDuration / oldDuration : 1

  let updatedWords = caption.words
  if (updatedWords && updatedWords.length > 0) {
    updatedWords = updatedWords.map(w => {
      const relStart = w.start - caption.start
      const relEnd = w.end - caption.start
      return {
        ...w,
        start: Number((newStart + relStart * ratio).toFixed(3)),
        end: Number((newStart + relEnd * ratio).toFixed(3)),
      }
    })
  }

  return {
    ...caption,
    start: newStart,
    end: newEnd,
    words: updatedWords,
  }
}

/**
 * Evenly distribute word timings when word timestamps are missing or need reset.
 */
export function recalculateWordTimings(caption: Caption): Caption {
  const words = caption.words || caption.text.split(/\s+/).map(text => ({ text, start: caption.start, end: caption.end }))
  if (words.length === 0) return caption

  const duration = caption.end - caption.start
  const wordDuration = duration / words.length

  const updatedWords: Word[] = words.map((w, idx) => ({
    text: w.text,
    start: Number((caption.start + idx * wordDuration).toFixed(3)),
    end: Number((caption.start + (idx + 1) * wordDuration).toFixed(3)),
  }))

  return {
    ...caption,
    words: updatedWords,
  }
}

/**
 * Format timestamp in SRT format (HH:MM:SS,mmm).
 */
export function formatSrtTimestamp(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 1000)
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(ms).padStart(3, '0')}`
}

/**
 * Format timestamp in VTT format (HH:MM:SS.mmm).
 */
export function formatVttTimestamp(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 1000)
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(3, '0')}`
}

/**
 * Parse SRT text content into Caption array.
 */
export function parseSrt(content: string): Caption[] {
  const cleaned = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const blocks = cleaned.split(/\n\s*\n/)
  const captions: Caption[] = []

  for (const block of blocks) {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean)
    if (lines.length >= 2) {
      // Find the line with -->
      const timeLineIndex = lines.findIndex(l => l.includes('-->'))
      if (timeLineIndex !== -1) {
        const timeLine = lines[timeLineIndex]
        const [startStr, endStr] = timeLine.split('-->').map(s => s.trim())
        const start = parseTimestamp(startStr)
        const end = parseTimestamp(endStr)
        const textLines = lines.slice(timeLineIndex + 1)
        const text = textLines.join('\n')

        if (!isNaN(start) && !isNaN(end) && text) {
          captions.push({
            id: randomUUID(),
            text,
            start,
            end,
          })
        }
      }
    }
  }

  return captions
}

function parseTimestamp(timeStr: string): number {
  const parts = timeStr.replace(',', '.').split(':')
  if (parts.length === 3) {
    const hours = parseFloat(parts[0])
    const minutes = parseFloat(parts[1])
    const seconds = parseFloat(parts[2])
    return hours * 3600 + minutes * 60 + seconds
  } else if (parts.length === 2) {
    const minutes = parseFloat(parts[0])
    const seconds = parseFloat(parts[1])
    return minutes * 60 + seconds
  }
  return parseFloat(timeStr) || 0
}

/**
 * Validate captions for overlaps, negative durations, and empty text.
 */
export function validateCaptions(captions: Caption[]): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  for (let i = 0; i < captions.length; i++) {
    const c = captions[i]
    if (!c.text || c.text.trim() === '') {
      errors.push(`Caption ${i + 1} has empty text`)
    }
    if (c.start < 0 || c.end < 0) {
      errors.push(`Caption ${i + 1} has negative timestamp`)
    }
    if (c.start >= c.end) {
      errors.push(`Caption ${i + 1} has start time greater than or equal to end time`)
    }
    if (i > 0 && c.start < captions[i - 1].end) {
      errors.push(`Caption ${i + 1} overlaps with previous caption`)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
