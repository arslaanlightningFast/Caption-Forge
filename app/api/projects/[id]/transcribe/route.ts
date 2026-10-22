import { NextRequest, NextResponse } from 'next/server'
import { getProject, updateProject } from '@/lib/storage'
import { getProvider } from '@/lib/transcribe'

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

    let body: any = {}
    try {
      body = await request.json()
    } catch {}

    const language = body.language || 'en'
    const providerName = body.provider
    const apiKey = body.apiKey || process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY

    await updateProject(id, { status: 'transcribing', error: undefined })

    try {
      let provider
      if (providerName === 'groq' || providerName === 'openai' || apiKey) {
        process.env.GROQ_API_KEY = apiKey || process.env.GROQ_API_KEY
        const { GroqWhisperProvider } = await import('@/lib/transcribe')
        provider = new GroqWhisperProvider()
      } else {
        provider = getProvider(providerName)
      }

      const captions = await provider.transcribe(project.videoPath, language)

      const updated = await updateProject(id, {
        captions,
        status: 'ready',
      })

      return NextResponse.json({ captions, project: updated })
    } catch (transcribeError: any) {
      console.error('Transcription execution error:', transcribeError)
      await updateProject(id, {
        status: 'error',
        error: transcribeError.message || 'Transcription failed',
      })
      return NextResponse.json(
        { error: 'Transcription failed', details: transcribeError.message },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Transcribe route error:', error)
    return NextResponse.json(
      { error: 'Failed to process transcription request', details: error.message },
      { status: 500 }
    )
  }
}
