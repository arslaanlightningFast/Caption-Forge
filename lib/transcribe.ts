import { Word, Caption } from './types'
import { extractAudio } from './ffmpeg'
import { transliterateToHinglish } from './transliterate'
import { promises as fs } from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'

export interface TranscriptionProvider {
  name: string
  transcribe(videoPath: string, language?: string): Promise<Caption[]>
}

/**
 * Stub provider for development and testing when no real transcription service is configured.
 */
export class StubProvider implements TranscriptionProvider {
  name = 'stub'

  async transcribe(_videoPath: string, _language = 'en'): Promise<Caption[]> {
    return [
      {
        id: randomUUID(),
        text: 'Welcome to Caption Forge, the ultimate AI video captioning tool.',
        start: 0,
        end: 3.5,
        words: [
          { text: 'Welcome', start: 0, end: 0.5 },
          { text: 'to', start: 0.5, end: 0.7 },
          { text: 'Caption', start: 0.7, end: 1.2 },
          { text: 'Forge,', start: 1.2, end: 1.6 },
          { text: 'the', start: 1.6, end: 1.8 },
          { text: 'ultimate', start: 1.8, end: 2.2 },
          { text: 'AI', start: 2.2, end: 2.5 },
          { text: 'video', start: 2.5, end: 2.9 },
          { text: 'captioning', start: 2.9, end: 3.3 },
          { text: 'tool.', start: 3.3, end: 3.5 },
        ]
      },
      {
        id: randomUUID(),
        text: 'Generate stunning animated captions in seconds.',
        start: 3.8,
        end: 7.0,
        words: [
          { text: 'Generate', start: 3.8, end: 4.3 },
          { text: 'stunning', start: 4.3, end: 4.8 },
          { text: 'animated', start: 4.8, end: 5.3 },
          { text: 'captions', start: 5.3, end: 5.8 },
          { text: 'in', start: 5.8, end: 6.0 },
          { text: 'seconds.', start: 6.0, end: 7.0 },
        ]
      },
      {
        id: randomUUID(),
        text: 'Export in multiple aspect ratios for TikTok, Reels, and Shorts.',
        start: 7.5,
        end: 12.0,
        words: [
          { text: 'Export', start: 7.5, end: 8.0 },
          { text: 'in', start: 8.0, end: 8.2 },
          { text: 'multiple', start: 8.2, end: 8.7 },
          { text: 'aspect', start: 8.7, end: 9.1 },
          { text: 'ratios', start: 9.1, end: 9.6 },
          { text: 'for', start: 9.6, end: 9.8 },
          { text: 'TikTok,', start: 9.8, end: 10.3 },
          { text: 'Reels,', start: 10.3, end: 10.8 },
          { text: 'and', start: 10.8, end: 11.0 },
          { text: 'Shorts.', start: 11.0, end: 12.0 },
        ]
      }
    ]
  }
}

/**
 * Local Whisper integration via CLI.
 */
export class WhisperLocalProvider implements TranscriptionProvider {
  name = 'whisper-local'

  async transcribe(videoPath: string, language = 'en'): Promise<Caption[]> {
    const modelPath = process.env.WHISPER_MODEL_PATH
    if (!modelPath) {
      throw new Error('WHISPER_MODEL_PATH environment variable not set.')
    }

    const audioPath = await extractAudio(videoPath)
    const { execFile } = await import('node:child_process')
    const outputDir = path.dirname(audioPath)
    const args = [
      '--model', modelPath,
      '--language', language,
      '--output_format', 'json',
      '--output_dir', outputDir,
      audioPath
    ]

    return new Promise<Caption[]>((resolve, reject) => {
      execFile('whisper', args, {}, async (err: Error | null, _stdout: string, _stderr: string) => {
        try {
          await fs.unlink(audioPath)
        } catch {}

        if (err) return reject(err)

        try {
          const baseName = path.basename(audioPath, path.extname(audioPath))
          const jsonPath = path.join(outputDir, `${baseName}.json`)
          const fileContent = await fs.readFile(jsonPath, 'utf8')
          const data = JSON.parse(fileContent)

          try {
            await fs.unlink(jsonPath)
          } catch {}

          const captions: Caption[] = (data.segments || []).map((seg: any) => ({
            id: randomUUID(),
            text: transliterateToHinglish(seg.text.trim()),
            start: seg.start,
            end: seg.end,
            words: seg.words?.map((w: any) => ({
              text: transliterateToHinglish(w.word.trim()),
              start: w.start,
              end: w.end,
            }))
          }))

          resolve(captions)
        } catch (parseErr) {
          reject(parseErr)
        }
      })
    })
  }
}

/**
 * Groq Whisper Large V3 API provider.
 */
export class GroqWhisperProvider implements TranscriptionProvider {
  name = 'groq'

  async transcribe(videoPath: string, language = 'en'): Promise<Caption[]> {
    const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('GROQ_API_KEY environment variable not set.')
    }

    const audioPath = await extractAudio(videoPath)
    try {
      const audioBuffer = await fs.readFile(audioPath)
      const formData = new FormData()

      const blob = new Blob([audioBuffer], { type: 'audio/wav' })
      formData.append('file', blob, 'audio.wav')
      formData.append('model', 'whisper-large-v3')
      formData.append('response_format', 'verbose_json')
      formData.append('timestamp_granularities[]', 'word')
      formData.append('language', 'hi')
      formData.append('prompt', 'Transcribe all spoken Hindi audio strictly in natural Roman/Latin script (Hinglish). Spell "nahi" as nahi, "software" as software, "hai" as hai, "kya" as kya. Never use Devanagari script.')

      const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errText = await response.text()
        throw new Error(`Groq Whisper API error: ${response.status} ${errText}`)
      }

      const data = await response.json()
      const rawCaptions: Caption[] = []

      const words: Word[] = (data.words || []).map((w: any) => ({
        text: transliterateToHinglish(w.word.trim()),
        start: w.start,
        end: w.end,
      }))

      if (words.length === 0 && data.segments) {
        for (const seg of data.segments) {
          rawCaptions.push({
            id: randomUUID(),
            text: transliterateToHinglish(seg.text.trim()),
            start: seg.start,
            end: seg.end,
          })
        }
      } else {
        const chunkSize = 6
        for (let i = 0; i < words.length; i += chunkSize) {
          const chunk = words.slice(i, i + chunkSize)
          if (chunk.length === 0) continue
          rawCaptions.push({
            id: randomUUID(),
            text: transliterateToHinglish(chunk.map((w) => w.text).join(' ')),
            start: chunk[0].start,
            end: chunk[chunk.length - 1].end,
            words: chunk,
          })
        }
      }

      return rawCaptions
    } finally {
      try {
        await fs.unlink(audioPath)
      } catch {}
    }
  }
}

/**
 * OpenAI Whisper API provider.
 */
export class OpenAIWhisperProvider implements TranscriptionProvider {
  name = 'openai'

  async transcribe(videoPath: string, language = 'en'): Promise<Caption[]> {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable not set.')
    }

    const audioPath = await extractAudio(videoPath)
    try {
      const audioBuffer = await fs.readFile(audioPath)
      const formData = new FormData()

      // Convert Buffer to Blob for fetch API
      const blob = new Blob([audioBuffer], { type: 'audio/wav' })
      formData.append('file', blob, 'audio.wav')
      formData.append('model', 'whisper-1')
      formData.append('response_format', 'verbose_json')
      formData.append('timestamp_granularities[]', 'word')
      formData.append('language', 'hi')
      formData.append('prompt', 'Transcribe all spoken Hindi audio strictly in natural Roman/Latin script (Hinglish). Spell "nahi" as nahi, "software" as software, "hai" as hai, "kya" as kya. Never use Devanagari script.')

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errText = await response.text()
        throw new Error(`OpenAI Whisper API error: ${response.status} ${errText}`)
      }

      const data = await response.json()
      const captions: Caption[] = []

      // Group words into readable caption segments (e.g. 5-7 words per segment)
      const words: Word[] = (data.words || []).map((w: any) => ({
        text: transliterateToHinglish(w.word.trim()),
        start: w.start,
        end: w.end,
      }))

      if (words.length === 0 && data.segments) {
        // Fallback to segments if words not returned
        for (const seg of data.segments) {
          captions.push({
            id: randomUUID(),
            text: transliterateToHinglish(seg.text.trim()),
            start: seg.start,
            end: seg.end,
          })
        }
      } else {
        const chunkSize = 6
        for (let i = 0; i < words.length; i += chunkSize) {
          const chunk = words.slice(i, i + chunkSize)
          if (chunk.length === 0) continue
          captions.push({
            id: randomUUID(),
            text: transliterateToHinglish(chunk.map((w) => w.text).join(' ')),
            start: chunk[0].start,
            end: chunk[chunk.length - 1].end,
            words: chunk,
          })
        }
      }

      return captions
    } finally {
      try {
        await fs.unlink(audioPath)
      } catch {}
    }
  }
}

/**
 * Deepgram API provider.
 */
export class DeepgramProvider implements TranscriptionProvider {
  name = 'deepgram'

  async transcribe(videoPath: string, language = 'en'): Promise<Caption[]> {
    const apiKey = process.env.DEEPGRAM_API_KEY
    if (!apiKey) {
      throw new Error('DEEPGRAM_API_KEY environment variable not set.')
    }

    const audioPath = await extractAudio(videoPath)
    try {
      const audioBuffer = await fs.readFile(audioPath)
      const url = `https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&language=${language}&punctuate=true&diarize=false&paragraphs=false`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${apiKey}`,
          'Content-Type': 'audio/wav',
        },
        body: audioBuffer,
      })

      if (!response.ok) {
        const errText = await response.text()
        throw new Error(`Deepgram API error: ${response.status} ${errText}`)
      }

      const data = await response.json()
      const alt = data.results?.channels?.[0]?.alternatives?.[0] || {}
      const words: Word[] = (alt.words || []).map((w: any) => ({
        text: transliterateToHinglish(w.punctuated_word || w.word),
        start: w.start,
        end: w.end,
      }))

      const captions: Caption[] = []
      const chunkSize = 6
      for (let i = 0; i < words.length; i += chunkSize) {
        const chunk = words.slice(i, i + chunkSize)
        if (chunk.length === 0) continue
        captions.push({
          id: randomUUID(),
          text: transliterateToHinglish(chunk.map((w) => w.text).join(' ')),
          start: chunk[0].start,
          end: chunk[chunk.length - 1].end,
          words: chunk,
        })
      }

      if (captions.length === 0 && alt.transcript) {
        captions.push({
          id: randomUUID(),
          text: transliterateToHinglish(alt.transcript.trim()),
          start: 0,
          end: 10,
        })
      }

      return captions
    } finally {
      try {
        await fs.unlink(audioPath)
      } catch {}
    }
  }
}

/**
 * Factory function to get the configured transcription provider.
 */
export function getProvider(providerName?: string): TranscriptionProvider {
  const selected = providerName || process.env.TRANSCRIPTION_PROVIDER

  if (selected === 'openai' || (!selected && process.env.OPENAI_API_KEY)) {
    if (process.env.OPENAI_API_KEY) return new OpenAIWhisperProvider()
  }
  if (selected === 'deepgram' || (!selected && process.env.DEEPGRAM_API_KEY)) {
    if (process.env.DEEPGRAM_API_KEY) return new DeepgramProvider()
  }
  if (selected === 'whisper-local' || (!selected && process.env.WHISPER_MODEL_PATH)) {
    if (process.env.WHISPER_MODEL_PATH) return new WhisperLocalProvider()
  }

  return new StubProvider()
}

export const getTranscriptionProvider = getProvider

/**
 * Get available providers and their configuration status.
 */
export function getAvailableProviders(): Array<{ name: string; configured: boolean; active: boolean }> {
  const activeProvider = getProvider().name

  return [
    {
      name: 'stub',
      configured: true,
      active: activeProvider === 'stub',
    },
    {
      name: 'openai',
      configured: Boolean(process.env.OPENAI_API_KEY),
      active: activeProvider === 'openai',
    },
    {
      name: 'deepgram',
      configured: Boolean(process.env.DEEPGRAM_API_KEY),
      active: activeProvider === 'deepgram',
    },
    {
      name: 'whisper-local',
      configured: Boolean(process.env.WHISPER_MODEL_PATH),
      active: activeProvider === 'whisper-local',
    },
  ]
}
