import { NextRequest, NextResponse } from 'next/server'
import { getExportsDir, getProject } from '@/lib/storage'
import { createReadStream, existsSync } from 'fs'
import { stat } from 'fs/promises'
import { join } from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const searchParams = request.nextUrl.searchParams
    const fileName = searchParams.get('file')

    let filePath = ''
    if (fileName) {
      filePath = join(getExportsDir(), fileName)
    } else {
      const project = await getProject(id)
      if (!project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 })
      }
      filePath = project.videoPath
    }

    if (!existsSync(/*turbopackIgnore: true*/ filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    const fileStat = await stat(/*turbopackIgnore: true*/ filePath)
    const fileStream = createReadStream(/*turbopackIgnore: true*/ filePath)

    const headers = new Headers({
      'Content-Length': fileStat.size.toString(),
      'Content-Type': 'video/mp4',
      'Content-Disposition': `attachment; filename="caption-forge-${id}.mp4"`,
    })

    return new NextResponse(fileStream as any, { headers })
  } catch (error: any) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'Failed to download file', details: error.message },
      { status: 500 }
    )
  }
}
