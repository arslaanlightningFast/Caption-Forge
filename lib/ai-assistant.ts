import { Caption, Word } from './types'
import { transliterateToHinglish } from './transliterate'

const FILLER_WORDS = /\b(um|uh|erm|ah|like|you know|sort of|kind of)\b/gi

const EMOJI_MAP: Record<string, string> = {
  ai: '🤖',
  video: '🎬',
  tool: '🛠️',
  forge: '🔥',
  fast: '⚡',
  quick: '⚡',
  speed: '🚀',
  money: '💰',
  success: '🏆',
  love: '❤️',
  amazing: '✨',
  stunning: '🌟',
  explore: '🌍',
  global: '🌐',
  share: '📤',
  download: '📥',
  create: '🎨',
  creator: '🎥',
  tiktok: '📱',
  reels: '📸',
  shorts: '▶️',
  youtube: '📺',
  welcome: '👋',
  ultimate: '👑',
  cool: '😎',
  fire: '🔥',
  power: '💪',
  win: '🏆',
}

/**
 * Remove filler words from caption texts and word lists.
 */
export function cleanFillerWords(captions: Caption[]): Caption[] {
  return captions.map(c => {
    const cleanedText = c.text.replace(FILLER_WORDS, '').replace(/\s+/g, ' ').trim()
    const cleanedWords = c.words?.filter(w => {
      const lower = w.text.toLowerCase().replace(/[^a-z]/g, '')
      return !['um', 'uh', 'erm', 'ah', 'like'].includes(lower)
    })
    return {
      ...c,
      text: cleanedText,
      words: cleanedWords && cleanedWords.length > 0 ? cleanedWords : undefined
    }
  })
}

/**
 * Automatically inject context-aware emojis into captions based on keywords.
 */
export function addEmojisToCaptions(captions: Caption[]): Caption[] {
  return captions.map(c => {
    let text = c.text
    const lower = text.toLowerCase()
    let added = false

    for (const [keyword, emoji] of Object.entries(EMOJI_MAP)) {
      if (lower.includes(keyword) && !text.includes(emoji)) {
        text = `${text} ${emoji}`
        added = true
        break
      }
    }

    return { ...c, text }
  })
}

/**
 * Fix and transliterate Hinglish spellings across all captions and words.
 */
export function fixHinglishSpellings(captions: Caption[]): Caption[] {
  return captions.map(c => ({
    ...c,
    text: transliterateToHinglish(c.text),
    words: c.words?.map(w => ({
      ...w,
      text: transliterateToHinglish(w.text)
    }))
  }))
}

/**
 * Capitalize key words or format captions for short-form impact.
 */
export function enhanceCaptions(captions: Caption[]): Caption[] {
  let processed = cleanFillerWords(captions)
  processed = addEmojisToCaptions(processed)
  processed = fixHinglishSpellings(processed)
  return processed
}
