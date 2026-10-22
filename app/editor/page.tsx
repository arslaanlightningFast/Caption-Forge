'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { useEditorStore } from '@/lib/store'
import { LeftSidebar } from '@/components/editor/LeftSidebar'
import { RightSidebar } from '@/components/editor/RightSidebar'
import { VideoPreview } from '@/components/editor/VideoPreview'
import { Timeline } from '@/components/editor/Timeline'
import { Button } from '@/components/ui/button'
import { Upload, ArrowLeft, Video, CheckCircle2, Sparkles, FolderOpen, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { formatFileSize } from '@/lib/utils'
import { Logo } from '@/components/ui/Logo'

export default function EditorPage() {
  const { project, setProject } = useEditorStore()
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [projectsList, setProjectsList] = useState<any[]>([])
  const [showProjectsModal, setShowProjectsModal] = useState(false)

  // Fetch existing projects on mount
  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        if (data.projects) setProjectsList(data.projects)
      })
      .catch(() => {})
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    const videoFile = files.find(file => file.type.startsWith('video/'))

    if (videoFile) {
      await handleFileUpload(videoFile)
    }
  }, [])

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await handleFileUpload(file)
    }
  }, [])

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('video/')) {
      alert('Please upload a video file')
      return
    }

    const maxSize = 500 * 1024 * 1024 // 500MB
    if (file.size > maxSize) {
      alert('File size must be less than 500MB')
      return
    }

    setUploading(true)
    setUploadProgress(10)

    try {
      const formData = new FormData()
      formData.append('video', file)

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => (prev >= 90 ? prev : prev + 15))
      }, 200)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) throw new Error('Upload failed')

      const data = await response.json()

      // Create local URL for preview
      const videoUrl = URL.createObjectURL(file)

      if (data.project) {
        setProject({
          ...data.project,
          videoUrl: `/api/projects/${data.project.id}/video`
        })
      }

      setUploading(false)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload video. Please try again.')
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const loadProject = async (p: any) => {
    const res = await fetch(`/api/projects/${p.id}`)
    const data = await res.json()
    if (data.project) {
      setProject({
        ...data.project,
        videoUrl: `/api/projects/${data.project.id}/video`
      })
      setShowProjectsModal(false)
    }
  }

  const deleteProj = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this project?')) return
    await fetch(`/api/projects/${id}`, { method: 'DELETE' })
    setProjectsList(prev => prev.filter(p => p.id !== id))
  }

  // If no project is loaded, show upload / project selector screen
  if (!project) {
    return (
      <main className="min-h-screen bg-[#0d1210] text-gray-100 flex flex-col selection:bg-lime-400 selection:text-black">
        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-tr from-lime-500/10 via-emerald-600/5 to-transparent blur-[140px] rounded-full pointer-events-none" />

        {/* Header */}
        <header className="border-b border-white/10 bg-[#141c18]/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="container mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
            <div className="flex items-center gap-2">
              <Logo className="w-9 h-9" size={20} />
              <span className="text-lg font-bold tracking-tight text-white">
                Caption<span className="text-lime-400 font-normal italic">Forge</span> Studio
              </span>
            </div>
            {projectsList.length > 0 ? (
              <Button variant="outline" size="sm" onClick={() => setShowProjectsModal(true)} className="border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-full">
                <FolderOpen className="w-4 h-4 mr-2 text-lime-400" /> My Projects ({projectsList.length})
              </Button>
            ) : <div className="w-24" />}
          </div>
        </header>

        <div className="flex-1 container mx-auto px-4 py-16 flex flex-col items-center justify-center max-w-4xl relative z-10">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight">
              Create <span className="font-serif italic font-normal text-lime-400">Captioned</span> Video
            </h1>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Upload a video to automatically transcribe speech, generate animated subtitles, and export for Reels & Shorts.
            </p>
          </div>

          {/* Upload Dropzone */}
          <div
            className={`
              w-full relative border-2 border-dashed rounded-3xl p-16 text-center transition-all cursor-pointer backdrop-blur-xl
              ${isDragging
                ? 'border-lime-400 bg-lime-400/10'
                : 'border-white/10 bg-[#141c18]/60 hover:border-lime-400/40 hover:bg-[#141c18]'
              }
              ${uploading ? 'pointer-events-none' : ''}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !uploading && document.getElementById('video-file-input')?.click()}
          >
            <input
              type="file"
              id="video-file-input"
              accept="video/*"
              className="hidden"
              onChange={handleFileSelect}
              disabled={uploading}
            />

            {uploading ? (
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-lime-400/20 rounded-full flex items-center justify-center animate-pulse">
                  <Upload className="w-8 h-8 text-lime-400" />
                </div>
                <div>
                  <p className="text-lg font-medium mb-2 text-white">Uploading and Processing Video...</p>
                  <div className="max-w-xs mx-auto bg-white/10 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-lime-400 h-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-lime-400 mt-2 font-mono">{uploadProgress}%</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-lime-400/20 rounded-full flex items-center justify-center shadow-lg shadow-lime-400/10">
                  <Upload className="w-8 h-8 text-lime-400" />
                </div>
                <div>
                  <p className="text-xl font-semibold mb-2 text-white">
                    Drag and drop your video file here
                  </p>
                  <p className="text-sm text-gray-400">
                    Supports MP4, MOV, WebM • Max 500MB • Up to 10 minutes
                  </p>
                </div>
                <Button className="mt-4 bg-lime-400 hover:bg-lime-300 text-black font-semibold rounded-full px-6 shadow-lg shadow-lime-400/20">
                  Browse Files
                </Button>
              </div>
            )}
          </div>

          {projectsList.length > 0 && (
            <div className="mt-12 w-full">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Recent Projects</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projectsList.slice(0, 4).map(p => (
                  <div
                    key={p.id}
                    onClick={() => loadProject(p)}
                    className="p-4 rounded-2xl bg-[#141c18]/80 border border-white/10 hover:border-lime-400/40 cursor-pointer flex items-center justify-between transition-all backdrop-blur-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-lime-400/10 flex items-center justify-center text-lime-400">
                        <Video className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-white truncate max-w-[200px]">{p.name}</h4>
                        <p className="text-xs text-gray-400">Updated {new Date(p.updatedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" onClick={(e) => deleteProj(p.id, e)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    )
  }

  // Professional 3-panel editor workspace in organic dark theme
  return (
    <div className="h-screen w-screen flex flex-col bg-[#0d1210] text-gray-100 overflow-hidden selection:bg-lime-400 selection:text-black">
      {/* Top Header */}
      <header className="h-14 border-b border-white/10 bg-[#141c18] px-4 flex items-center justify-between z-30 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setProject(null)}
            className="text-gray-400 hover:text-white rounded-full"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Projects
          </Button>
          <span className="text-white/20">|</span>
          <h1 className="text-sm font-semibold truncate max-w-xs text-white">{project.name}</h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1 rounded-full bg-lime-400/10 border border-lime-400/20 text-lime-400 font-medium">
            Status: {project.status}
          </span>
        </div>
      </header>

      {/* Main 3-Panel Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Presets & Captions */}
        <LeftSidebar />

        {/* Center Workspace: Video Preview & Timeline */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0f0d]">
          <div className="flex-1 overflow-hidden">
            <VideoPreview />
          </div>
          <Timeline />
        </div>

        {/* Right Sidebar: Style & Export */}
        <RightSidebar />
      </div>
    </div>
  )
}
