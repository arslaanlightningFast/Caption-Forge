import { create } from 'zustand'
import { Project, Caption, CaptionStyle, ExportOptions, captionPresets } from './types'

interface EditorState {
  project: Project | null
  currentTime: number
  isPlaying: boolean
  selectedCaptionId: string | null
  activeTab: 'presets' | 'style' | 'export' | 'captions'
  zoom: number

  // Actions
  setProject: (project: Project | null) => void
  updateProject: (updates: Partial<Project>) => void
  setCurrentTime: (time: number) => void
  setIsPlaying: (playing: boolean) => void
  setSelectedCaptionId: (id: string | null) => void
  setActiveTab: (tab: 'presets' | 'style' | 'export' | 'captions') => void
  setZoom: (zoom: number) => void

  // Caption actions
  updateCaption: (id: string, updates: Partial<Caption>) => void
  addCaption: (caption: Caption) => void
  deleteCaption: (id: string) => void
  splitCaption: (id: string, splitTime: number) => void
  mergeCaptions: (id1: string, id2: string) => void

  // Style actions
  updateStyle: (updates: Partial<CaptionStyle>) => void
  applyPreset: (presetId: string) => void

  // AI Assistant actions
  cleanFillers: () => void
  addEmojis: () => void
  fixSpellings: () => void
}

export const useEditorStore = create<EditorState>((set, get) => ({
  project: null,
  currentTime: 0,
  isPlaying: false,
  selectedCaptionId: null,
  activeTab: 'presets',
  zoom: 1,

  setProject: (project) => set({ project, selectedCaptionId: project?.captions?.[0]?.id || null }),

  updateProject: (updates) => set((state) => ({
    project: state.project ? { ...state.project, ...updates, updatedAt: new Date() } : null
  })),

  setCurrentTime: (currentTime) => set({ currentTime }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setSelectedCaptionId: (selectedCaptionId) => set({ selectedCaptionId }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setZoom: (zoom) => set({ zoom }),

  updateCaption: (id, updates) => set((state) => {
    if (!state.project) return state
    const captions = state.project.captions.map(c => c.id === id ? { ...c, ...updates } : c)
    return { project: { ...state.project, captions, updatedAt: new Date() } }
  }),

  addCaption: (caption) => set((state) => {
    if (!state.project) return state
    const captions = [...state.project.captions, caption].sort((a, b) => a.start - b.start)
    return { project: { ...state.project, captions, updatedAt: new Date() } }
  }),

  deleteCaption: (id) => set((state) => {
    if (!state.project) return state
    const captions = state.project.captions.filter(c => c.id !== id)
    return { project: { ...state.project, captions, updatedAt: new Date() } }
  }),

  splitCaption: (id, splitTime) => set((state) => {
    if (!state.project) return state
    const target = state.project.captions.find(c => c.id === id)
    if (!target || splitTime <= target.start || splitTime >= target.end) return state

    // Split text approximately in half or at words
    const words = target.words || []
    let text1 = ''
    let text2 = ''
    if (words.length > 0) {
      const words1 = words.filter(w => w.end <= splitTime)
      const words2 = words.filter(w => w.start >= splitTime)
      text1 = words1.map(w => w.text).join(' ')
      text2 = words2.map(w => w.text).join(' ')
    } else {
      const mid = Math.floor(target.text.length / 2)
      text1 = target.text.slice(0, mid).trim()
      text2 = target.text.slice(mid).trim()
    }

    const c1: Caption = { ...target, text: text1, end: splitTime, words: target.words?.filter(w => w.end <= splitTime) }
    const c2: Caption = { id: Math.random().toString(36).substring(7), text: text2, start: splitTime, end: target.end, words: target.words?.filter(w => w.start >= splitTime) }

    const captions = state.project.captions.flatMap(c => (c.id === id ? [c1, c2] : [c]))
    return { project: { ...state.project, captions, updatedAt: new Date() } }
  }),

  mergeCaptions: (id1, id2) => set((state) => {
    if (!state.project) return state
    const c1 = state.project.captions.find(c => c.id === id1)
    const c2 = state.project.captions.find(c => c.id === id2)
    if (!c1 || !c2) return state

    const merged: Caption = {
      id: c1.id,
      text: `${c1.text} ${c2.text}`,
      start: Math.min(c1.start, c2.start),
      end: Math.max(c1.end, c2.end),
      words: [...(c1.words || []), ...(c2.words || [])]
    }

    const captions = state.project.captions.filter(c => c.id !== id1 && c.id !== id2)
    captions.push(merged)
    captions.sort((a, b) => a.start - b.start)

    return { project: { ...state.project, captions, updatedAt: new Date() } }
  }),

  updateStyle: (updates) => set((state) => {
    if (!state.project) return state
    const style = { ...state.project.style, ...updates }
    return { project: { ...state.project, style, updatedAt: new Date() } }
  }),

  applyPreset: (presetId) => set((state) => {
    if (!state.project) return state
    const preset = captionPresets.find(p => p.id === presetId)
    if (!preset) return state
    return { project: { ...state.project, style: { ...preset }, updatedAt: new Date() } }
  }),

  cleanFillers: () => set((state) => {
    if (!state.project) return state
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { cleanFillerWords } = require('./ai-assistant')
    const captions = cleanFillerWords(state.project.captions)
    return { project: { ...state.project, captions, updatedAt: new Date() } }
  }),

  addEmojis: () => set((state) => {
    if (!state.project) return state
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { addEmojisToCaptions } = require('./ai-assistant')
    const captions = addEmojisToCaptions(state.project.captions)
    return { project: { ...state.project, captions, updatedAt: new Date() } }
  }),

  fixSpellings: () => set((state) => {
    if (!state.project) return state
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { fixHinglishSpellings } = require('./ai-assistant')
    const captions = fixHinglishSpellings(state.project.captions)
    return { project: { ...state.project, captions, updatedAt: new Date() } }
  })
}))
