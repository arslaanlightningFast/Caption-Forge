import { NextRequest, NextResponse } from 'next/server'
import { getAllProjects, saveProject } from '@/lib/storage'
import { Project, captionPresets } from '@/lib/types'
import { randomUUID } from 'crypto'

export async function GET() {
  try {
    const projects = await getAllProjects()
    return NextResponse.json({ projects })
  } catch (error: any) {
    console.error('List projects error:', error)
    return NextResponse.json(
      { error: 'Failed to list projects', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    if (!body.name || !body.videoPath) {
      return NextResponse.json(
        { error: 'Name and videoPath are required' },
        { status: 400 }
      )
    }

    const now = new Date()
    const project: Project = {
      id: randomUUID(),
      name: body.name,
      videoPath: body.videoPath,
      videoUrl: body.videoUrl,
      thumbnailUrl: body.thumbnailUrl,
      duration: body.duration || 0,
      width: body.width || 1280,
      height: body.height || 720,
      captions: body.captions || [],
      style: body.style || captionPresets[0],
      status: body.status || 'ready',
      createdAt: now,
      updatedAt: now,
    }

    await saveProject(project)
    return NextResponse.json({ project }, { status: 201 })
  } catch (error: any) {
    console.error('Create project error:', error)
    return NextResponse.json(
      { error: 'Failed to create project', details: error.message },
      { status: 500 }
    )
  }
}
