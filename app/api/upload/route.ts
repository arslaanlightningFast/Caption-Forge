import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'
import { saveProject, getUploadsDir } from '@/lib/storage'
import { getVideoMetadata, generateThumbnail } from '@/lib/ffmpeg'
import { Project, captionPresets } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('video') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No video file provided' },
        { status: 400 }
      )
    }

    if (!file.type.startsWith('video/')) {
      return NextResponse.json(
        { error: 'File must be a video' },
        { status: 400 }
      )
    }

    const maxSize = parseInt(process.env.MAX_FILE_SIZE || String(500 * 1024 * 1024), 10)
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds maximum limit' },
        { status: 400 }
      )
    }

    const projectId = randomUUID()
    const projectUploadDir = join(getUploadsDir(), projectId)
    await mkdir(projectUploadDir, { recursive: true })

    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const videoFileName = `${randomUUID()}-${sanitizedName}`
    const videoPath = join(projectUploadDir, videoFileName)

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(videoPath, buffer)

    // Extract metadata
    let duration = 0
    let width = 1280
    let height = 720
    try {
      const meta = await getVideoMetadata(videoPath)
      duration = meta.duration
      width = meta.width
      height = meta.height
    } catch {}

    // Generate thumbnail
    const thumbFileName = 'thumbnail.jpg'
    const thumbPath = join(projectUploadDir, thumbFileName)
    let thumbnailUrl = `/api/projects/${projectId}/thumbnail`
    try {
      await generateThumbnail(videoPath, Math.min(1, duration / 2), thumbPath)
    } catch {
      thumbnailUrl = ''
    }

    // Auto-transcribe upon upload so captions are immediately ready
    let captions: any[] = []
    try {
      const { getProvider } = await import('@/lib/transcribe')
      const provider = getProvider()
      captions = await provider.transcribe(videoPath, 'en')
      if (duration === 0 && captions.length > 0) {
        duration = captions[captions.length - 1].end + 1
      }
    } catch (err) {
      console.error('Auto-transcription failed on upload:', err)
    }

    const now = new Date()
    const newProject: Project = {
      id: projectId,
      name: file.name.replace(/\.[^/.]+$/, ''),
      videoPath,
      videoUrl: `/api/projects/${projectId}/video`,
      thumbnailUrl,
      duration: duration || 15,
      width,
      height,
      captions,
      style: captionPresets[0],
      status: 'ready',
      createdAt: now,
      updatedAt: now,
    }

    await saveProject(newProject)

    return NextResponse.json({ project: newProject }, { status: 201 })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload video', details: error.message },
      { status: 500 }
    )
  }
}
