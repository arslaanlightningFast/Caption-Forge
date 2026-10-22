'use client'

import React, { useState } from 'react'
import { useEditorStore } from '@/lib/store'
import { captionPresets } from '@/lib/types'
import { Sparkles, Sliders, Type, FileText, Plus, Trash2, Split, Merge, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatTime } from '@/lib/utils'

export function LeftSidebar() {
  const { project, activeTab, setActiveTab, applyPreset, selectedCaptionId, setSelectedCaptionId, updateCaption, deleteCaption, splitCaption, addCaption, currentTime, cleanFillers, addEmojis, fixSpellings } = useEditorStore()
  const [transcribing, setTranscribing] = useState(false)
  const [savedNoticeId, setSavedNoticeId] = useState<string | null>(null)

  const handleTranscribe = async () => {
    if (!project) return
    const savedKey = typeof window !== 'undefined' ? localStorage.getItem('groq_api_key') || localStorage.getItem('openai_api_key') || '' : ''
    const useGroq = confirm('Do you want to use your Groq API Key (Whisper Large V3) for ultra-fast high-accuracy transcription?\n\n(Click Cancel to use Free Browser Speech AI)')

    let apiKey = savedKey
    if (useGroq) {
      if (!savedKey) {
        const entered = prompt('Enter your Groq API Key (gsk_...):')
        if (entered) {
          apiKey = entered.trim()
          localStorage.setItem('groq_api_key', apiKey)
        } else {
          return
        }
      }
    }

    setTranscribing(true)
    try {
      if (useGroq && apiKey) {
        const res = await fetch(`/api/projects/${project.id}/transcribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ provider: 'groq', apiKey, language: 'hinglish' })
        })
        if (!res.ok) {
          const errData = await res.json()
          throw new Error(errData.details || errData.error || 'Groq transcription failed')
        }
        const data = await res.json()
        if (data.captions) {
          useEditorStore.getState().updateProject({ captions: data.captions, status: 'ready' })
        }
      } else {
        const videoEl = document.querySelector('video') as HTMLVideoElement
        if (videoEl && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)) {
          const { transcribeVideoWithBrowserSpeech } = await import('@/lib/browser-speech')
          const captions = await transcribeVideoWithBrowserSpeech(videoEl)
          if (captions && captions.length > 0) {
            useEditorStore.getState().updateProject({ captions, status: 'ready' })
            setTranscribing(false)
            return
          }
        }

        const res = await fetch(`/api/projects/${project.id}/transcribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ provider: 'stub' })
        })
        if (!res.ok) throw new Error('Transcription failed')
        const data = await res.json()
        if (data.captions) {
          useEditorStore.getState().updateProject({ captions: data.captions, status: 'ready' })
        }
      }
    } catch (err: any) {
      console.error(err)
      alert(`Transcription error: ${err.message}`)
    } finally {
      setTranscribing(false)
    }
  }

  if (!project) return <div className="w-80 bg-[#0d1210] border-r border-white/10 p-4 text-gray-400">Loading...</div>

  return (
    <aside className="w-80 bg-[#0d1210] border-r border-white/10 flex flex-col h-full select-none">
      {/* Tab Navigation */}
      <div className="flex border-b border-white/10 p-2 gap-1 bg-[#141c18]/50">
        <button
          onClick={() => setActiveTab('presets')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'presets' ? 'bg-lime-400 text-black font-bold shadow-md shadow-lime-400/20' : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Presets
        </button>
        <button
          onClick={() => setActiveTab('captions')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'captions' ? 'bg-lime-400 text-black font-bold shadow-md shadow-lime-400/20' : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Captions ({project.captions.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'presets' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-200">Caption Styles & Presets</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={handleTranscribe}
                disabled={transcribing}
                className="text-xs h-7 bg-lime-400/10 border-lime-400/30 text-lime-400 hover:bg-lime-400/20 rounded-lg"
              >
                {transcribing ? 'Transcribing...' : 'Re-transcribe AI'}
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {captionPresets.map((preset) => {
                const isSelected = project.style.id === preset.id
                return (
                  <div
                    key={preset.id}
                    onClick={() => applyPreset(preset.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all backdrop-blur-md ${
                      isSelected
                        ? 'border-lime-400 bg-lime-400/10 shadow-lg shadow-lime-400/10'
                        : 'border-white/10 bg-[#141c18]/60 hover:border-lime-400/40 hover:bg-[#141c18]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm text-white">{preset.name}</span>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/5 text-gray-300 font-mono border border-white/10">
                        {preset.animation}
                      </span>
                    </div>

                    {/* Preview Badge */}
                    <div className="h-14 bg-black/60 rounded-xl flex items-center justify-center border border-white/10 p-2 overflow-hidden">
                      <span
                        style={{
                          fontFamily: preset.fontFamily,
                          fontSize: '14px',
                          fontWeight: preset.fontWeight,
                          color: preset.textColor,
                          textTransform: preset.uppercase ? 'uppercase' : 'none',
                        }}
                        className="truncate"
                      >
                        Sample Subtitle
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === 'captions' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-200">Edit Caption Segments</h3>
              <Button
                size="sm"
                onClick={() => {
                  const newCap = {
                    id: Math.random().toString(36).substring(7),
                    text: 'New caption',
                    start: currentTime,
                    end: currentTime + 2,
                  }
                  addCaption(newCap)
                }}
                className="h-7 text-xs bg-lime-400 hover:bg-lime-300 text-black font-semibold rounded-lg shadow-md shadow-lime-400/20"
              >
                <Plus className="w-3 h-3 mr-1" /> Add
              </Button>
            </div>

            {/* AI Assistant Quick Tools */}
            <div className="grid grid-cols-2 gap-2 bg-[#141c18]/60 p-3 rounded-2xl border border-white/10">
              <Button
                size="sm"
                variant="outline"
                onClick={cleanFillers}
                className="text-xs h-7 bg-lime-400/10 border-lime-400/30 text-lime-400 hover:bg-lime-400/20 rounded-lg"
              >
                🧹 Clean Fillers
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={addEmojis}
                className="text-xs h-7 bg-emerald-400/10 border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/20 rounded-lg"
              >
                🚀 Auto Emojis
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={fixSpellings}
                className="text-xs h-7 bg-lime-400/10 border-lime-400/30 text-lime-400 hover:bg-lime-400/20 col-span-2 rounded-lg"
              >
                ✨ AI Spellcheck & Fix Hinglish
              </Button>
            </div>

            {project.captions.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-sm">
                No captions generated yet.<br />Click Re-transcribe AI above.
              </div>
            ) : (
              project.captions.map((cap) => {
                const isSelected = selectedCaptionId === cap.id
                const isActive = currentTime >= cap.start && currentTime <= cap.end
                const isNotice = savedNoticeId === cap.id

                return (
                  <div
                    key={cap.id}
                    onClick={() => setSelectedCaptionId(cap.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2.5 backdrop-blur-md ${
                      isActive
                        ? 'border-lime-400/80 bg-lime-400/10 shadow-lg shadow-lime-400/10'
                        : isSelected
                        ? 'border-white/30 bg-[#141c18]'
                        : 'border-white/10 bg-[#141c18]/40 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs text-gray-400 font-mono">
                      <span>{formatTime(cap.start)} → {formatTime(cap.end)}</span>
                      <div className="flex items-center gap-1">
                        <button
                          title="Split at current time"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (currentTime > cap.start && currentTime < cap.end) {
                              splitCaption(cap.id, currentTime)
                            } else {
                              alert('Move playhead inside this caption to split.')
                            }
                          }}
                          className="p-1 hover:text-lime-400 rounded transition-colors"
                        >
                          <Split className="w-3 h-3" />
                        </button>
                        <button
                          title="Delete caption"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteCaption(cap.id)
                          }}
                          className="p-1 hover:text-red-400 rounded transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <textarea
                      value={cap.text}
                      onChange={(e) => updateCaption(cap.id, { text: e.target.value })}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-sm text-gray-100 focus:outline-none focus:border-lime-400 resize-none font-sans"
                      rows={2}
                    />

                    {/* Word-by-Word Spelling Corrector */}
                    {isSelected && cap.words && cap.words.length > 0 && (
                      <div className="pt-2 border-t border-white/10 space-y-1.5">
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Word-by-Word Spellings</span>
                        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-black/60 rounded-xl border border-white/10">
                          {cap.words.map((w, wIdx) => (
                            <div key={wIdx} className="flex items-center gap-1 bg-[#141c18] px-2 py-1 rounded-lg border border-white/10">
                              <input
                                type="text"
                                value={w.text}
                                onChange={(e) => {
                                  const newWords = [...(cap.words || [])]
                                  newWords[wIdx] = { ...w, text: e.target.value }
                                  const newText = newWords.map(nw => nw.text).join(' ')
                                  updateCaption(cap.id, { words: newWords, text: newText })
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-16 bg-transparent text-xs text-white font-mono focus:outline-none border-b border-lime-400/50"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* OK / Apply Button */}
                    <div className="flex items-center justify-between pt-1">
                      {isNotice ? (
                        <span className="text-[10px] text-lime-400 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Applied to video!
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-500">Edit spelling & click OK</span>
                      )}
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSavedNoticeId(cap.id)
                          setTimeout(() => setSavedNoticeId(null), 2000)
                        }}
                        className="h-7 px-4 text-xs bg-lime-400 hover:bg-lime-300 text-black font-bold rounded-lg shadow-md shadow-lime-400/20"
                      >
                        OK
                      </Button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
    </aside>
  )
}
