import { Caption, Word } from './types'

export async function transcribeVideoWithBrowserSpeech(
  videoElement: HTMLVideoElement,
  onProgress?: (status: string) => void
): Promise<Caption[]> {
  return new Promise((resolve, reject) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      return reject(new Error('Browser Speech Recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.'))
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = false
    recognition.lang = 'hi-IN'

    const captions: Caption[] = []

    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          const transcript = event.results[i][0].transcript.trim()
          const end = videoElement.currentTime
          const start = Math.max(0, end - 4)

          const rawWords = transcript.split(/\s+/)
          const wordDuration = (end - start) / Math.max(1, rawWords.length)

          const words: Word[] = rawWords.map((w: string, idx: number) => ({
            text: w,
            start: Number((start + idx * wordDuration).toFixed(3)),
            end: Number((start + (idx + 1) * wordDuration).toFixed(3))
          }))

          captions.push({
            id: crypto.randomUUID(),
            text: transcript,
            start,
            end: Math.max(start + 0.5, end),
            words
          })
        }
      }
    }

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition notice:', event.error)
    }

    recognition.onend = () => {
      videoElement.pause()
      videoElement.currentTime = 0
      if (captions.length === 0) {
        resolve([
          {
            id: crypto.randomUUID(),
            text: 'No speech detected or recognition ended early. You can edit captions manually.',
            start: 0,
            end: 3,
          }
        ])
      } else {
        resolve(captions)
      }
    }

    if (onProgress) onProgress('Listening to video speech...')
    videoElement.currentTime = 0

    try {
      recognition.start()
      videoElement.play().catch(err => {
        recognition.stop()
        reject(new Error('Playback blocked by browser. Please click anywhere in the app and try again.'))
      })
    } catch (e: any) {
      reject(new Error(e.message || 'Failed to start speech recognition'))
    }
  })
}
