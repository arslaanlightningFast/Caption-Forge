import { NextRequest, NextResponse } from 'next/server'
import { getProject } from '@/lib/storage'
import { generateSrtContent, generateVttContent } from '@/lib/ffmpeg'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const project = await getProject(id)
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const format = request.nextUrl.searchParams.get('format') || 'srt'

    if (format === 'vtt') {
      const vtt = generateVttContent(project.captions)
      return new NextResponse(vtt, {
        headers: {
          'Content-Type': 'text/vtt; charset=utf-8',
          'Content-Disposition': `attachment; filename="caption-forge-${id}.vtt"`,
        },
      })
    } else {
      const srt = generateSrtContent(project.captions)
      return new NextResponse(srt, {
        headers: {
          'Content-Type': 'application/x-subrip; charset=utf-8',
          'Content-Disposition': `attachment; filename="caption-forge-${id}.srt"`,
        },
      })
    }
  } catch (error: any) {
    console.error('Subtitles export error:', error)
    return NextResponse.json(
      { error: 'Failed to export subtitles', details: error.message },
      { status: 500 }
    )
  }
}
