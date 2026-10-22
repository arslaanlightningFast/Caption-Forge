import { NextRequest, NextResponse } from 'next/server'
import { getProject } from '@/lib/storage'
import { createReadStream, existsSync } from 'fs'
import { stat } from 'fs/promises'

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const project = await getProject(id)
    if (!project || !existsSync(project.videoPath)) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    const fileStat = await stat(project.videoPath)
    const fileStream = createReadStream(project.videoPath)

    const headers = new Headers({
      'Content-Length': fileStat.size.toString(),
      'Content-Type': 'video/mp4',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
    })

    return new NextResponse(fileStream as any, { headers })
  } catch (error: any) {
    console.error('Video stream error:', error)
    return NextResponse.json(
      { error: 'Failed to stream video', details: error.message },
      { status: 500 }
    )
  }
}
