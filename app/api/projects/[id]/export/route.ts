import { NextRequest, NextResponse } from 'next/server'
import { getProject, updateProject, getExportsDir } from '@/lib/storage'
import { renderCaptionedVideo } from '@/lib/ffmpeg'
import { ExportOptions } from '@/lib/types'
import { join } from 'path'
import { mkdir } from 'fs/promises'
import { randomUUID } from 'crypto'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const project = await getProject(id)
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const body = await request.json().catch(() => ({}))
    console.log('EXPORT REQUEST BODY:', { hasCaptions: Boolean(body.captions), count: body.captions?.length, hasStyle: Boolean(body.style) })

    const exportOptions: ExportOptions = {
      aspectRatio: body.aspectRatio || '9:16',
      resolution: body.resolution || '1080p',
      format: body.format || 'mp4',
      quality: body.quality || 'medium',
      backgroundBlur: body.backgroundBlur ?? true,
    }

    const captions = body.captions && body.captions.length > 0 ? body.captions : project.captions
    const style = body.style || project.style

    // Update project with latest captions/style on server storage
    await updateProject(id, { captions, style, status: 'rendering', error: undefined })

    await mkdir(getExportsDir(), { recursive: true })
    const outputFilename = `${id}-${randomUUID()}.mp4`
    const outputPath = join(getExportsDir(), outputFilename)

    try {
      await renderCaptionedVideo({
        videoPath: project.videoPath,
        outputPath,
        captions,
        style,
        exportOptions,
      })

      const downloadUrl = `/api/projects/${id}/download?file=${outputFilename}`
      const updated = await updateProject(id, {
        status: 'completed',
      })

      return NextResponse.json({
        downloadUrl,
        project: updated,
      })
    } catch (renderError: any) {
      console.error('FFmpeg render error:', renderError)
      await updateProject(id, {
        status: 'error',
        error: renderError.message || 'Video rendering failed',
      })
      return NextResponse.json(
        { error: 'Video rendering failed', details: renderError.message },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Export route error:', error)
    return NextResponse.json(
      { error: 'Failed to process export request', details: error.message },
      { status: 500 }
    )
  }
}
