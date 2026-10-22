import ffmpeg from 'fluent-ffmpeg'
import ffmpegStatic from 'ffmpeg-static'
import { join } from 'path'
import { tmpdir } from 'os'
import { randomUUID } from 'crypto'
import { promises as fs } from 'fs'
import { Caption, CaptionStyle, ExportOptions } from './types'

export function getFFmpegPath(): string {
  if (process.env.FFMPEG_PATH) {
    return process.env.FFMPEG_PATH
  }
  if (ffmpegStatic) {
    return ffmpegStatic as string
  }
  return 'ffmpeg'
}

export function getFFprobePath(): string {
  if (process.env.FFPROBE_PATH) {
    return process.env.FFPROBE_PATH
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ffprobeStatic = require('ffprobe-static')
    if (ffprobeStatic && ffprobeStatic.path) {
      return ffprobeStatic.path
    }
  } catch {}
  return 'ffprobe'
}

// Configure fluent-ffmpeg binaries
try {
  ffmpeg.setFfmpegPath(getFFmpegPath())
  ffmpeg.setFfprobePath(getFFprobePath())
} catch {}

/**
 * Extract audio from a video file to a WAV file suitable for transcription.
 */
export async function extractAudio(videoPath: string): Promise<string> {
  const outputPath = join(tmpdir(), `${randomUUID()}.wav`)
  return new Promise<string>((resolve, reject) => {
    ffmpeg(videoPath)
      .noVideo()
      .audioCodec('pcm_s16le')
      .audioChannels(1)
      .audioFrequency(16000)
      .format('wav')
      .output(outputPath)
      .on('end', () => resolve(outputPath))
      .on('error', (err) => reject(err))
      .run()
  })
}

/**
 * Get video metadata using ffprobe.
 */
export async function getVideoMetadata(videoPath: string): Promise<{
  duration: number
  width: number
  height: number
  fps: number
  codec: string
}> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) return reject(err)

      const format: any = metadata.format || {}
      const videoStream: any = metadata.streams?.find((s) => s.codec_type === 'video') || {}

      const duration = Number(format.duration) || Number(videoStream.duration) || 0
      const width = Number(videoStream.width) || 1280
      const height = Number(videoStream.height) || 720

      let fps = 30
      if (videoStream.r_frame_rate) {
        const parts = videoStream.r_frame_rate.split('/')
        if (parts.length === 2 && Number(parts[1]) > 0) {
          fps = Number(parts[0]) / Number(parts[1])
        } else {
          fps = Number(videoStream.r_frame_rate) || 30
        }
      }

      const codec = videoStream.codec_name || 'unknown'

      resolve({
        duration,
        width,
        height,
        fps,
        codec,
      })
    })
  })
}

/**
 * Generate a thumbnail image at a specific timestamp.
 */
export async function generateThumbnail(videoPath: string, timestamp: number, outputPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .screenshots({
        timestamps: [timestamp],
        filename: outputPath.split('\\').pop() || 'thumb.jpg',
        folder: outputPath.substring(0, outputPath.lastIndexOf('\\')) || tmpdir(),
        size: '320x?',
      })
      .on('end', () => resolve(outputPath))
      .on('error', (err) => reject(err))
  })
}

/**
 * Generate SRT content from captions.
 */
export function generateSrtContent(captions: Caption[]): string {
  const lines: string[] = []
  captions.forEach((c, idx) => {
    const start = formatSrtTimestamp(c.start)
    const end = formatSrtTimestamp(c.end)
    const text = c.text.replace(/\n/g, '\n')
    lines.push(`${idx + 1}\n${start} --> ${end}\n${text}\n`)
  })
  return lines.join('\n')
}

/**
 * Generate VTT content from captions.
 */
export function generateVttContent(captions: Caption[]): string {
  const lines: string[] = ['WEBVTT\n']
  captions.forEach((c, idx) => {
    const start = formatVttTimestamp(c.start)
    const end = formatVttTimestamp(c.end)
    const text = c.text.replace(/\n/g, '\n')
    lines.push(`${idx + 1}\n${start} --> ${end}\n${text}\n`)
  })
  return lines.join('\n')
}

export function formatSrtTimestamp(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 1000)
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(ms).padStart(3, '0')}`
}

export function formatVttTimestamp(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 1000)
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(3, '0')}`
}

/**
 * Convert CSS hex color to ASS color format (&HAA_BB_GG_RR).
 */
export function cssColorToAss(hex: string, opacity = 1): string {
  let cleanHex = hex.replace('#', '')
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('')
  }
  const r = cleanHex.substring(0, 2) || 'FF'
  const g = cleanHex.substring(2, 4) || 'FF'
  const b = cleanHex.substring(4, 6) || 'FF'

  const alphaHex = Math.round((1 - opacity) * 255).toString(16).padStart(2, '0').toUpperCase()

  return `&H${alphaHex}${b}${g}${r}`
}

/**
 * Generate Advanced SubStation Alpha (.ass) subtitle content using universal system font (Arial) for 100% reliable rendering.
 */
export function generateAssContent(captions: Caption[], style: CaptionStyle, targetWidth = 1080, targetHeight = 1920): string {
  // Use selected font family or fallback to Arial
  const fontName = style.fontFamily || 'Arial'
  const fontSize = style.fontSize || 54
  const primaryColor = cssColorToAss(style.textColor || '#FFFFFF')
  const outlineColor = cssColorToAss(style.outlineColor || '#000000')
  const backColor = cssColorToAss(style.backgroundColor || '#000000', style.backgroundOpacity ?? 0.6)
  const outlineWidth = style.outlineWidth ?? 3
  const shadow = style.shadowBlur ?? 2

  let alignment = 2
  if (style.position === 'top') alignment = 8
  if (style.position === 'center') alignment = 5
  if (style.position === 'bottom') alignment = 2

  const scriptInfo = `[Script Info]
ScriptType: v4.00+
PlayResX: ${targetWidth}
PlayResY: ${targetHeight}
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,${fontName},${fontSize},${primaryColor},&H000000FF,${outlineColor},${backColor},1,0,0,0,100,100,0,0,1,${outlineWidth},${shadow},${alignment},20,20,80,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`

  const dialogueLines = captions.map(c => {
    const start = formatAssTimestamp(c.start)
    const end = formatAssTimestamp(c.end)
    const text = (style.uppercase ? c.text.toUpperCase() : c.text).replace(/\n/g, '\\N')
    return `Dialogue: 0,${start},${end},Default,,0,0,0,,${text}`
  })

  return scriptInfo + '\n' + dialogueLines.join('\n')
}

export function formatAssTimestamp(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  const cs = Math.floor((seconds % 1) * 100)
  return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(cs).padStart(2, '0')}`
}

/**
 * Write subtitle file (.ass) with properly escaped absolute path for FFmpeg subtitles filter on Windows.
 */
export async function writeSubtitleFile(captions: Caption[], style: CaptionStyle, targetWidth = 1080, targetHeight = 1920): Promise<string> {
  const assContent = generateAssContent(captions, style, targetWidth, targetHeight)
  const filename = `sub_${randomUUID()}.ass`
  const filePath = join(process.cwd(), filename)
  await fs.writeFile(filePath, assContent, 'utf8')

  const absolutePath = filePath.replace(/\\/g, '/')
  const escapedPath = absolutePath.replace(':', '\\:')
  return escapedPath
}

/**
 * Render captioned video with aspect ratio padding/cropping and burnt-in subtitles matching exact style.
 */
export async function renderCaptionedVideo(options: {
  videoPath: string
  outputPath: string
  captions: Caption[]
  style: CaptionStyle
  exportOptions: ExportOptions
  onProgress?: (progress: number) => void
}): Promise<string> {
  const { videoPath, outputPath, captions, style, exportOptions, onProgress } = options

  let targetWidth = 1080
  let targetHeight = 1920

  switch (exportOptions.aspectRatio) {
    case '9:16':
      targetWidth = 1080
      targetHeight = 1920
      break
    case '16:9':
      targetWidth = 1920
      targetHeight = 1080
      break
    case '1:1':
      targetWidth = 1080
      targetHeight = 1080
      break
    case '4:5':
      targetWidth = 1080
      targetHeight = 1350
      break
  }

  if (exportOptions.resolution === '720p') {
    if (targetWidth > targetHeight) {
      targetWidth = 1280
      targetHeight = 720
    } else {
      targetHeight = 1280
      targetWidth = 720
    }
  }

  const subtitlePath = await writeSubtitleFile(captions, style, targetWidth, targetHeight)

  return new Promise((resolve, reject) => {
    let filterComplex = ''
    if (exportOptions.backgroundBlur) {
      filterComplex = [
        `[0:v]scale=${targetWidth}:${targetHeight}:force_original_aspect_ratio=increase,crop=${targetWidth}:${targetHeight},gblur=sigma=25[bg]`,
        `[0:v]scale=${targetWidth}:${targetHeight}:force_original_aspect_ratio=decrease[fg]`,
        `[bg][fg]overlay=(W-w)/2:(H-h)/2[base]`,
        `[base]subtitles='${subtitlePath}'`
      ].join(';')
    } else {
      filterComplex = [
        `scale=${targetWidth}:${targetHeight}:force_original_aspect_ratio=decrease`,
        `pad=${targetWidth}:${targetHeight}:(ow-iw)/2:(oh-ih)/2:black`,
        `subtitles='${subtitlePath}'`
      ].join(',')
    }

    let command = ffmpeg(videoPath)
      .outputOptions([
        '-filter_complex', filterComplex,
        '-c:v', 'libx264',
        '-preset', exportOptions.quality === 'high' ? 'slow' : 'medium',
        '-crf', exportOptions.quality === 'high' ? '18' : exportOptions.quality === 'low' ? '28' : '23',
        '-c:a', 'aac',
        '-b:a', '192k',
      ])
      .output(outputPath)

    if (onProgress) {
      command.on('progress', (progress) => {
        if (progress && typeof progress.percent === 'number') {
          onProgress(Math.min(100, Math.max(0, progress.percent)))
        }
      })
    }

    command
      .on('end', async () => {
        try {
          const cleanPath = subtitlePath.replace(/\\:/g, ':')
          await fs.unlink(cleanPath)
        } catch {}
        resolve(outputPath)
      })
      .on('error', async (err) => {
        try {
          const cleanPath = subtitlePath.replace(/\\:/g, ':')
          await fs.unlink(cleanPath)
        } catch {}
        reject(err)
      })
      .run()
  })
}
