import { Project, ExportOptions } from './types'

export async function exportVideoClientSide(
  project: Project,
  exportOptions: ExportOptions,
  onProgress: (progress: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.src = project.videoUrl || ''
    video.crossOrigin = 'anonymous'
    video.muted = false

    video.onloadedmetadata = async () => {
      const width = exportOptions.aspectRatio === '9:16' ? 1080 : exportOptions.aspectRatio === '1:1' ? 1080 : 1920
      const height = exportOptions.aspectRatio === '9:16' ? 1920 : exportOptions.aspectRatio === '1:1' ? 1080 : 1080

      try {
        const fontName = project.style.fontFamily || 'Montserrat'
        const fontSizeNum = (project.style.fontSize || 54) * (width / 1080) * 1.4
        await document.fonts.load(`${project.style.fontWeight || 700} ${fontSizeNum}px "${fontName}"`)
      } catch {}

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('Canvas context failed'))

      const stream = canvas.captureStream(30)

      try {
        const audioStream = (video as any).captureStream ? (video as any).captureStream() : null
        if (audioStream && audioStream.getAudioTracks().length > 0) {
          stream.addTrack(audioStream.getAudioTracks()[0])
        }
      } catch {}

      let mimeType = 'video/webm;codecs=vp9,opus'
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm'
      }

      let recorder: MediaRecorder
      try {
        recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 10000000 })
      } catch (e) {
        recorder = new MediaRecorder(stream)
      }

      const chunks: Blob[] = []
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' })
        const url = URL.createObjectURL(blob)
        resolve(url)
      }

      recorder.start()
      video.currentTime = 0
      video.play().catch(() => {
        // Fallback if autoplay blocked
        video.muted = true
        video.play()
      })

      const duration = video.duration || project.duration

      const drawFrame = () => {
        if (video.ended || video.currentTime >= duration) {
          recorder.stop()
          video.pause()
          return
        }

        const currentTime = video.currentTime
        onProgress(Math.min(99, Math.round((currentTime / Math.max(1, duration)) * 100)))

        ctx.clearRect(0, 0, width, height)

        // 1. Draw Background (Blurred or Black)
        if (exportOptions.backgroundBlur) {
          ctx.save()
          ctx.filter = 'blur(25px)'
          ctx.drawImage(video, 0, 0, width, height)
          ctx.fillStyle = 'rgba(0, 0, 0, 0.45)'
          ctx.fillRect(0, 0, width, height)
          ctx.restore()
        } else {
          ctx.fillStyle = '#000000'
          ctx.fillRect(0, 0, width, height)
        }

        // 2. Draw Main Video Centered
        const vW = video.videoWidth || 1280
        const vH = video.videoHeight || 720
        const scale = Math.min(width / vW, height / vH)
        const dW = vW * scale
        const dH = vH * scale
        const dX = (width - dW) / 2
        const dY = (height - dH) / 2

        ctx.drawImage(video, dX, dY, dW, dH)

        // 3. Draw Active Captions with exact style
        const activeCaption = project.captions.find(
          c => currentTime >= c.start && currentTime <= c.end
        )

        if (activeCaption) {
          const style = project.style
          const text = style.uppercase ? activeCaption.text.toUpperCase() : activeCaption.text

          ctx.save()
          const fontSize = (style.fontSize * (width / 1080)) * 1.4
          ctx.font = `${style.fontWeight || 700} ${fontSize}px "${style.fontFamily || 'Montserrat'}", sans-serif`
          ctx.textAlign = style.alignment || 'center'
          ctx.textBaseline = 'middle'

          const posX = (width * (style.positionX ?? 50)) / 100
          const posY = (height * (style.positionY ?? 80)) / 100

          // Background box if set
          if (style.backgroundColor && style.backgroundColor !== 'transparent') {
            ctx.fillStyle = style.backgroundColor
            const metrics = ctx.measureText(text)
            const boxPadding = 20
            ctx.fillRect(posX - metrics.width / 2 - boxPadding, posY - fontSize / 2 - boxPadding / 2, metrics.width + boxPadding * 2, fontSize + boxPadding)
          }

          // Outline / Stroke
          if (style.outlineWidth > 0) {
            ctx.lineWidth = style.outlineWidth * 2
            ctx.strokeStyle = style.outlineColor || '#000000'
            ctx.strokeText(text, posX, posY)
          }

          // Text Fill
          ctx.fillStyle = style.textColor || '#FFFFFF'
          ctx.fillText(text, posX, posY)

          ctx.restore()
        }

        requestAnimationFrame(drawFrame)
      }

      requestAnimationFrame(drawFrame)
    }

    video.onerror = () => reject(new Error('Video load failed for client export'))
  })
}
