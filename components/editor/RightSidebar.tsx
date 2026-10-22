'use client'

import React, { useState } from 'react'
import { useEditorStore } from '@/lib/store'
import { Sliders, Palette, Type, Sparkles, Download, CheckCircle2, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function RightSidebar() {
  const { project, updateStyle, updateProject } = useEditorStore()
  const [activeTab, setActiveTab] = useState<'style' | 'export'>('style')
  const [rendering, setRendering] = useState(false)
  const [renderProgress, setRenderProgress] = useState(0)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [backgroundBlur, setBackgroundBlur] = useState(true)

  if (!project) return <div className="w-80 bg-[#0d1210] border-l border-white/10 p-4 text-gray-400">Loading...</div>

  const style = project.style

  const handleClientExport = async () => {
    setRendering(true)
    setRenderProgress(10)
    try {
      const { exportVideoClientSide } = await import('@/lib/client-render')
      const exportUrl = await exportVideoClientSide(
        project,
        {
          aspectRatio: '9:16',
          resolution: '1080p',
          format: 'mp4',
          quality: 'high',
          backgroundBlur,
        },
        (progress) => setRenderProgress(progress)
      )
      setRenderProgress(100)
      setDownloadUrl(exportUrl)
    } catch (err: any) {
      console.error(err)
      alert(`Client export failed: ${err.message}`)
    } finally {
      setRendering(false)
    }
  }

  const handleExport = async () => {
    setRendering(true)
    setRenderProgress(20)
    try {
      const res = await fetch(`/api/projects/${project.id}/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aspectRatio: '9:16',
          resolution: '1080p',
          format: 'mp4',
          quality: 'high',
          backgroundBlur,
          captions: project.captions,
          style: project.style,
        })
      })
      setRenderProgress(80)
      if (!res.ok) throw new Error('Render failed')
      const data = await res.json()
      setRenderProgress(100)
      setDownloadUrl(data.downloadUrl)
    } catch (err) {
      console.error(err)
      alert('Export failed. Check console.')
    } finally {
      setRendering(false)
    }
  }

  return (
    <aside className="w-80 bg-[#0d1210] border-l border-white/10 flex flex-col h-full select-none">
      {/* Top Tabs */}
      <div className="flex border-b border-white/10 p-2 gap-1 bg-[#141c18]/50">
        <button
          onClick={() => setActiveTab('style')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'style' ? 'bg-lime-400 text-black font-bold shadow-md shadow-lime-400/20' : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          Style & Design
        </button>
        <button
          onClick={() => setActiveTab('export')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'export' ? 'bg-lime-400 text-black font-bold shadow-md shadow-lime-400/20' : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Download className="w-3.5 h-3.5" />
          Export Video
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {activeTab === 'style' && (
          <div className="space-y-6">
            {/* Typography */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Typography</h4>
              <div className="space-y-2">
                <label className="text-xs text-gray-300">Viral Font Family</label>
                <select
                  value={style.fontFamily}
                  onChange={(e) => updateStyle({ fontFamily: e.target.value })}
                  className="w-full bg-[#141c18] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-lime-400"
                >
                  <option value="Inter">Inter (Clean Modern)</option>
                  <option value="Montserrat">Montserrat (Viral Reels)</option>
                  <option value="Poppins">Poppins (Creator Bold)</option>
                  <option value="Bangers">Bangers (Comic / Paint Brush)</option>
                  <option value="Permanent Marker">Permanent Marker (Marker Brush)</option>
                  <option value="Caveat">Caveat (Curved / Handwriting)</option>
                  <option value="Anton">Anton (Bold Cinematic Header)</option>
                  <option value="Bebas Neue">Bebas Neue (Shorts / Reels)</option>
                  <option value="Pacifico">Pacifico (Curved Script)</option>
                  <option value="Courier New">Courier New (Typewriter)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-gray-300">Font Size ({style.fontSize}px)</label>
                <input
                  type="range"
                  min="24"
                  max="80"
                  value={style.fontSize}
                  onChange={(e) => updateStyle({ fontSize: Number(e.target.value) })}
                  className="w-full accent-lime-400 cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-gray-300">Font Weight ({style.fontWeight})</label>
                <select
                  value={style.fontWeight}
                  onChange={(e) => updateStyle({ fontWeight: Number(e.target.value) })}
                  className="w-full bg-[#141c18] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-lime-400"
                >
                  <option value={400}>Regular</option>
                  <option value={600}>Semi-Bold</option>
                  <option value={700}>Bold</option>
                  <option value={800}>Extra Bold</option>
                  <option value={900}>Black</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-300">Uppercase</span>
                <input
                  type="checkbox"
                  checked={style.uppercase}
                  onChange={(e) => updateStyle({ uppercase: e.target.checked })}
                  className="w-4 h-4 accent-lime-400 rounded cursor-pointer"
                />
              </div>
            </div>

            <hr className="border-white/10" />

            {/* Colors */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Colors</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-gray-300">Text Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={style.textColor}
                      onChange={(e) => updateStyle({ textColor: e.target.value })}
                      className="w-8 h-8 rounded-lg bg-transparent cursor-pointer border border-white/10"
                    />
                    <span className="text-xs font-mono text-gray-400">{style.textColor}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-300">Highlight Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={style.highlightColor}
                      onChange={(e) => updateStyle({ highlightColor: e.target.value })}
                      className="w-8 h-8 rounded-lg bg-transparent cursor-pointer border border-white/10"
                    />
                    <span className="text-xs font-mono text-gray-400">{style.highlightColor}</span>
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-white/10" />

            {/* Positioning & Layout */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Position & Alignment</h4>
              <div className="grid grid-cols-3 gap-2">
                {(['top', 'center', 'bottom'] as const).map(pos => (
                  <button
                    key={pos}
                    onClick={() => updateStyle({ position: pos })}
                    className={`py-2 rounded-xl text-xs capitalize font-medium transition-all ${
                      style.position === pos ? 'bg-lime-400 text-black font-bold shadow-md shadow-lime-400/20' : 'bg-[#141c18] border border-white/10 text-gray-400 hover:text-white hover:bg-[#1c2822]'
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-white/10" />

            {/* Animation */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Animation Style</h4>
              <select
                value={style.animation}
                onChange={(e) => updateStyle({ animation: e.target.value as any })}
                className="w-full bg-[#141c18] border border-white/10 rounded-xl p-2.5 text-xs text-white capitalize focus:outline-none focus:border-lime-400"
              >
                <option value="none">Static (None)</option>
                <option value="fade">Fade In/Out</option>
                <option value="pop">Pop In</option>
                <option value="karaoke">Karaoke Highlight</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === 'export' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-white">Export Final Video</h3>
              <p className="text-xs text-gray-400">
                Render captions permanently onto your video for Instagram Reels, YouTube Shorts, or TikTok.
              </p>
            </div>

            {rendering ? (
              <div className="space-y-4 p-6 rounded-2xl bg-[#141c18]/80 border border-white/10 text-center backdrop-blur-md">
                <div className="w-12 h-12 mx-auto bg-lime-400/20 rounded-full flex items-center justify-center animate-spin border border-lime-400/30">
                  <Sparkles className="w-6 h-6 text-lime-400" />
                </div>
                <div>
                  <p className="text-sm font-medium mb-2 text-white">Rendering 100% Faithful Video...</p>
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-lime-400 h-full transition-all duration-300"
                      style={{ width: `${renderProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-lime-400 mt-2 font-mono">{renderProgress}% Complete</p>
                </div>
              </div>
            ) : downloadUrl ? (
              <div className="space-y-4 p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center backdrop-blur-md">
                <div className="w-12 h-12 mx-auto bg-emerald-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-emerald-400 mb-1">Export Complete!</h4>
                  <p className="text-xs text-gray-300 mb-4">Your captioned video with exact font & edits is ready.</p>
                  <a href={downloadUrl} download="captionforge-export.webm">
                    <Button className="w-full bg-lime-400 hover:bg-lime-300 text-black font-bold rounded-xl shadow-lg shadow-lime-400/20">
                      Download Captioned Video
                    </Button>
                  </a>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#141c18] border border-white/10 space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Format</span>
                    <span className="font-semibold text-white">MP4 / WebM (HD)</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Resolution</span>
                    <span className="font-semibold text-white">1080 x 1920 (9:16 Vertical)</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Fidelity</span>
                    <span className="font-semibold text-lime-400 flex items-center gap-1">
                      <Zap className="w-3 h-3" /> 100% Pixel-Perfect
                    </span>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-white">Blurred Background</span>
                      <p className="text-[10px] text-gray-400">Adds blurred video behind 9:16 crop</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={backgroundBlur}
                      onChange={(e) => setBackgroundBlur(e.target.checked)}
                      className="w-4 h-4 accent-lime-400 rounded cursor-pointer"
                    />
                  </div>
                </div>

                <Button onClick={handleClientExport} className="w-full py-3.5 bg-lime-400 hover:bg-lime-300 text-black font-bold rounded-xl shadow-lg shadow-lime-400/20 transition-all">
                  <Zap className="w-4 h-4 mr-2" />
                  ⚡ Pro Instant Export (100% Faithful)
                </Button>

                <div className="pt-4 border-t border-white/10 space-y-2">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Subtitles Only</h4>
                  <div className="flex gap-2">
                    <a href={`/api/projects/${project.id}/subtitles?format=srt`} download className="flex-1">
                      <Button variant="outline" size="sm" className="w-full text-xs border-white/10 bg-[#141c18] hover:bg-[#1c2822] text-white rounded-xl">Download SRT</Button>
                    </a>
                    <a href={`/api/projects/${project.id}/subtitles?format=vtt`} download className="flex-1">
                      <Button variant="outline" size="sm" className="w-full text-xs border-white/10 bg-[#141c18] hover:bg-[#1c2822] text-white rounded-xl">Download VTT</Button>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  )
}
