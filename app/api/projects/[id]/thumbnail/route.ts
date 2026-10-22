import { NextRequest, NextResponse } from 'next/server'
import { getProject } from '@/lib/storage'
import { createReadStream, existsSync } from 'fs'
import { stat } from 'fs/promises'
import { join, dirname } from 'path'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const project = await getProject(id)
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const thumbPath = join(dirname(project.videoPath), 'thumbnail.jpg')
    if (!existsSync(thumbPath)) {
      return NextResponse.json({ error: 'Thumbnail not found' }, { status: 404 })
    }

    const fileStat = await stat(thumbPath)
    const fileStream = createReadStream(thumbPath)

    const headers = new Headers({
      'Content-Length': fileStat.size.toString(),
      'Content-Type': 'image/jpeg',
    })

    return new NextResponse(fileStream as any, { headers })
  } catch (error: any) {
    console.error('Thumbnail error:', error)
    return NextResponse.json(
      { error: 'Failed to get thumbnail', details: error.message },
      { status: 500 }
    )
  }
}
