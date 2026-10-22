// Caption types
export interface Word {
  text: string
  start: number
  end: number
}

export interface Caption {
  id: string
  text: string
  start: number
  end: number
  words?: Word[]
}

export interface CaptionStyle {
  id: string
  name: string
  fontFamily: string
  fontSize: number
  fontWeight: number
  textColor: string
  highlightColor: string
  backgroundColor: string
  backgroundOpacity: number
  outlineWidth: number
  outlineColor: string
  shadowX: number
  shadowY: number
  shadowBlur: number
  shadowColor: string
  position: 'top' | 'center' | 'bottom'
  positionX?: number // percentage 0-100 (default 50)
  positionY?: number // percentage 0-100 (default 80)
  alignment: 'left' | 'center' | 'right'
  maxWidth: number
  maxWordsPerLine: number
  uppercase: boolean
  animation: 'none' | 'fade' | 'pop' | 'karaoke'
  animationSpeed: number
}

export interface Project {
  id: string
  name: string
  videoPath: string
  videoUrl?: string
  thumbnailUrl?: string
  duration: number
  width: number
  height: number
  captions: Caption[]
  style: CaptionStyle
  status: 'uploading' | 'processing' | 'transcribing' | 'ready' | 'rendering' | 'completed' | 'error'
  error?: string
  createdAt: Date
  updatedAt: Date
}

export interface ExportOptions {
  aspectRatio: '9:16' | '16:9' | '1:1' | '4:5'
  resolution: '720p' | '1080p' | 'original'
  format: 'mp4'
  quality: 'low' | 'medium' | 'high'
  backgroundBlur?: boolean
}

// Preset caption styles (all 8 styles required)
export const captionPresets: CaptionStyle[] = [
  {
    id: 'clean-minimal',
    name: 'Clean Minimal',
    fontFamily: 'Inter',
    fontSize: 48,
    fontWeight: 600,
    textColor: '#FFFFFF',
    highlightColor: '#FFFFFF',
    backgroundColor: 'transparent',
    backgroundOpacity: 0,
    outlineWidth: 0,
    outlineColor: '#000000',
    shadowX: 0,
    shadowY: 4,
    shadowBlur: 8,
    shadowColor: 'rgba(0,0,0,0.5)',
    position: 'bottom',
    positionX: 50,
    positionY: 80,
    alignment: 'center',
    maxWidth: 90,
    maxWordsPerLine: 6,
    uppercase: false,
    animation: 'none',
    animationSpeed: 1
  },
  {
    id: 'bold-creator',
    name: 'Bold Creator',
    fontFamily: 'Montserrat',
    fontSize: 56,
    fontWeight: 800,
    textColor: '#FFFFFF',
    highlightColor: '#FFD700',
    backgroundColor: 'transparent',
    backgroundOpacity: 0,
    outlineWidth: 6,
    outlineColor: '#000000',
    shadowX: 0,
    shadowY: 0,
    shadowBlur: 0,
    shadowColor: 'transparent',
    position: 'center',
    positionX: 50,
    positionY: 50,
    alignment: 'center',
    maxWidth: 85,
    maxWordsPerLine: 4,
    uppercase: true,
    animation: 'pop',
    animationSpeed: 1.2
  },
  {
    id: 'fitness-punch',
    name: 'Fitness Punch',
    fontFamily: 'Bangers',
    fontSize: 60,
    fontWeight: 900,
    textColor: '#FFFF00',
    highlightColor: '#FF0055',
    backgroundColor: 'rgba(0,0,0,0.8)',
    backgroundOpacity: 0.8,
    outlineWidth: 4,
    outlineColor: '#000000',
    shadowX: 2,
    shadowY: 2,
    shadowBlur: 0,
    shadowColor: '#000000',
    position: 'center',
    positionX: 50,
    positionY: 50,
    alignment: 'center',
    maxWidth: 90,
    maxWordsPerLine: 3,
    uppercase: true,
    animation: 'pop',
    animationSpeed: 1.5
  },
  {
    id: 'karaoke-highlight',
    name: 'Karaoke Highlight',
    fontFamily: 'Poppins',
    fontSize: 52,
    fontWeight: 700,
    textColor: '#FFFFFF',
    highlightColor: '#00D9FF',
    backgroundColor: 'rgba(0,0,0,0.7)',
    backgroundOpacity: 0.7,
    outlineWidth: 0,
    outlineColor: '#000000',
    shadowX: 0,
    shadowY: 2,
    shadowBlur: 4,
    shadowColor: 'rgba(0,0,0,0.3)',
    position: 'bottom',
    positionX: 50,
    positionY: 80,
    alignment: 'center',
    maxWidth: 90,
    maxWordsPerLine: 5,
    uppercase: false,
    animation: 'karaoke',
    animationSpeed: 1
  },
  {
    id: 'comic-brush',
    name: 'Comic & Brush',
    fontFamily: 'Permanent Marker',
    fontSize: 54,
    fontWeight: 800,
    textColor: '#00FFFF',
    highlightColor: '#FFDD00',
    backgroundColor: 'rgba(0,0,0,0.75)',
    backgroundOpacity: 0.75,
    outlineWidth: 3,
    outlineColor: '#000000',
    shadowX: 0,
    shadowY: 0,
    shadowBlur: 10,
    shadowColor: '#00FFFF',
    position: 'bottom',
    positionX: 50,
    positionY: 80,
    alignment: 'center',
    maxWidth: 88,
    maxWordsPerLine: 4,
    uppercase: false,
    animation: 'pop',
    animationSpeed: 1.2
  },
  {
    id: 'curved-script',
    name: 'Curved Script',
    fontFamily: 'Caveat',
    fontSize: 64,
    fontWeight: 700,
    textColor: '#FFFFFF',
    highlightColor: '#38BDF8',
    backgroundColor: 'rgba(17,24,39,0.8)',
    backgroundOpacity: 0.8,
    outlineWidth: 0,
    outlineColor: '#000000',
    shadowX: 0,
    shadowY: 2,
    shadowBlur: 4,
    shadowColor: 'rgba(0,0,0,0.4)',
    position: 'bottom',
    positionX: 50,
    positionY: 80,
    alignment: 'center',
    maxWidth: 92,
    maxWordsPerLine: 6,
    uppercase: false,
    animation: 'fade',
    animationSpeed: 1
  },
  {
    id: 'cinematic',
    name: 'Cinematic',
    fontFamily: 'Anton',
    fontSize: 50,
    fontWeight: 400,
    textColor: '#E5E7EB',
    highlightColor: '#FFFFFF',
    backgroundColor: 'transparent',
    backgroundOpacity: 0,
    outlineWidth: 1,
    outlineColor: '#000000',
    shadowX: 0,
    shadowY: 2,
    shadowBlur: 6,
    shadowColor: 'rgba(0,0,0,0.8)',
    position: 'bottom',
    positionX: 50,
    positionY: 85,
    alignment: 'center',
    maxWidth: 95,
    maxWordsPerLine: 8,
    uppercase: true,
    animation: 'fade',
    animationSpeed: 0.8
  },
  {
    id: 'hinglish-creator',
    name: 'Hinglish Creator',
    fontFamily: 'Montserrat',
    fontSize: 54,
    fontWeight: 700,
    textColor: '#FFFFFF',
    highlightColor: '#FF6B35',
    backgroundColor: 'rgba(0,0,0,0.6)',
    backgroundOpacity: 0.6,
    outlineWidth: 3,
    outlineColor: '#000000',
    shadowX: 0,
    shadowY: 3,
    shadowBlur: 6,
    shadowColor: 'rgba(0,0,0,0.4)',
    position: 'bottom',
    positionX: 50,
    positionY: 80,
    alignment: 'center',
    maxWidth: 88,
    maxWordsPerLine: 5,
    uppercase: false,
    animation: 'pop',
    animationSpeed: 1.1
  }
]
