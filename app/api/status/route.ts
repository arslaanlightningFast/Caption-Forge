import { NextResponse } from 'next/server'
import { getFFmpegPath, getFFprobePath } from '@/lib/ffmpeg'
import { getAvailableProviders } from '@/lib/transcribe'
import { promises as fs } from 'fs'
import { join } from 'path'

export async function GET() {
  let ffmpegAvailable = false
  let ffprobeAvailable = false

  try {
    const ffmpegPath = getFFmpegPath()
    await fs.access(ffmpegPath).catch(() => {
      // If not absolute path or in node_modules, might be in PATH
      if (ffmpegPath === 'ffmpeg') ffmpegAvailable = true
    })
    if (!ffmpegAvailable && ffmpegPath) {
      await fs.access(ffmpegPath)
      ffmpegAvailable = true
    }
  } catch {
    if (getFFmpegPath() === 'ffmpeg') ffmpegAvailable = true
  }

  try {
    const ffprobePath = getFFprobePath()
    await fs.access(ffprobePath).catch(() => {
      if (ffprobePath === 'ffprobe') ffprobeAvailable = true
    })
    if (!ffprobeAvailable && ffprobePath) {
      await fs.access(ffprobePath)
      ffprobeAvailable = true
    }
  } catch {
    if (getFFprobePath() === 'ffprobe') ffprobeAvailable = true
  }

  const storageDir = join(process.cwd(), 'storage')
  let storageWritable = true
  try {
    await fs.mkdir(storageDir, { recursive: true })
    const testFile = join(storageDir, 'test.tmp')
    await fs.writeFile(testFile, 'test')
    await fs.unlink(testFile)
  } catch {
    storageWritable = false
  }

  const providers = getAvailableProviders()

  return NextResponse.json({
    status: 'ok',
    version: '0.1.0',
    ffmpeg: {
      available: ffmpegAvailable,
      path: getFFmpegPath(),
    },
    ffprobe: {
      available: ffprobeAvailable,
      path: getFFprobePath(),
    },
    storage: {
      path: storageDir,
      writable: storageWritable,
    },
    transcriptionProviders: providers,
    timestamp: new Date().toISOString(),
  })
}
