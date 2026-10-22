import { NextRequest, NextResponse } from 'next/server'
import { getProject, updateProject, deleteProject } from '@/lib/storage'

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
    return NextResponse.json({ project })
  } catch (error: any) {
    console.error('Get project error:', error)
    return NextResponse.json(
      { error: 'Failed to get project', details: error.message },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const updated = await updateProject(id, body)
    if (!updated) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }
    return NextResponse.json({ project: updated })
  } catch (error: any) {
    console.error('Update project error:', error)
    return NextResponse.json(
      { error: 'Failed to update project', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const success = await deleteProject(id)
    if (!success) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete project error:', error)
    return NextResponse.json(
      { error: 'Failed to delete project', details: error.message },
      { status: 500 }
    )
  }
}
