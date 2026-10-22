'use client'

import { Button } from "@/components/ui/button"
import { Upload, Video, Sparkles, Download, Zap, Globe, CheckCircle2, Play, ShieldCheck, Film, Layers, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/ui/Logo"

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0d1210] text-gray-100 selection:bg-lime-400 selection:text-black relative overflow-hidden">
      {/* Background Organic Glow Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[550px] bg-gradient-to-tr from-lime-500/15 via-emerald-600/10 to-transparent blur-[150px] rounded-full pointer-events-none animate-glow" />

      {/* Floating Pill Header */}
      <header className="sticky top-6 z-50 px-6 max-w-7xl mx-auto">
        <div className="bg-[#141c18]/80 backdrop-blur-xl border border-white/10 rounded-full px-6 h-16 flex items-center justify-between shadow-2xl">
          <div className="flex items-center gap-3">
            <Logo className="w-10 h-10" size={22} />
            <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              Caption<span className="text-lime-400 font-normal italic">Forge</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
            <Link href="#features" className="hover:text-lime-400 transition-colors">Features</Link>
            <Link href="#preview" className="hover:text-lime-400 transition-colors">Studio Preview</Link>
            <Link href="#presets" className="hover:text-lime-400 transition-colors">Viral Presets</Link>
          </nav>

          <Link href="/editor">
            <Button className="bg-lime-400 hover:bg-lime-300 text-black font-semibold rounded-full px-6 shadow-lg shadow-lime-400/20 transition-all">
              Launch Studio <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-20 pb-20 md:pt-28 md:pb-24 relative z-10 max-w-7xl">
        <div className="grid lg:grid-cols-12 gap-12 items-center">

          {/* Left Text Column */}
          <div className="lg:col-span-7 text-left">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight leading-[1.08]">
              Create viral <br />
              <span className="font-serif italic font-normal text-lime-400">captions</span> on <br />
              purpose, every day.
            </h1>

            <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-xl leading-relaxed">
              The ultimate AI video caption generator for Reels, Shorts, and TikTok. Featuring word-by-word karaoke highlighting, custom creator fonts, and automated vertical rendering.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link href="/editor">
                <Button size="lg" className="bg-lime-400 hover:bg-lime-300 text-black font-bold px-8 py-6 h-auto text-base rounded-full shadow-xl shadow-lime-400/20 transition-all">
                  <Upload className="w-5 h-5 mr-2" />
                  Upload & Auto-Caption
                </Button>
              </Link>
              <Link href="/editor">
                <Button size="lg" variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-white px-8 py-6 h-auto text-base rounded-full backdrop-blur-md">
                  <Play className="w-4 h-4 mr-2 text-lime-400 fill-lime-400" />
                  Try Studio Demo
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-6 mt-10 text-xs text-gray-400">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-lime-400" /> Free & Browser-ready</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-lime-400" /> 9:16 Vertical Export</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-lime-400" /> Instant AI Sync</span>
            </div>
          </div>

          {/* Right Floating Glass Widgets Column (Inspired by Screenshot) */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto w-full max-w-md aspect-[4/5] rounded-3xl bg-gradient-to-b from-[#18241f] to-[#111915] border border-white/10 p-6 flex flex-col justify-between shadow-2xl backdrop-blur-xl overflow-hidden group">

              {/* Background ambient glow inside card */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-lime-500/10 rounded-full blur-3xl pointer-events-none"></div>

              {/* Top Widget: Live Session Player */}
              <div className="bg-[#1c2822]/90 border border-white/10 rounded-2xl p-4 backdrop-blur-md shadow-lg">
                <div className="flex items-center justify-between mb-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1.5 text-lime-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-lime-400 animate-ping"></span>
                    AI GENERATING CAPTIONS
                  </span>
                  <span>02:14</span>
                </div>
                <div className="text-white font-semibold text-sm mb-3">
                  "Unleash your creative potential..."
                </div>
                <div className="relative w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-3">
                  <div className="absolute top-0 left-0 h-full w-3/4 bg-lime-400 rounded-full"></div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-full bg-lime-400 flex items-center justify-center text-black shadow-md cursor-pointer">
                    <Play className="w-4 h-4 fill-black ml-0.5" />
                  </div>
                  <span className="text-[10px] text-lime-400/80 bg-lime-400/10 px-2.5 py-1 rounded-full font-mono">
                    Groq Whisper V3
                  </span>
                </div>
              </div>

              {/* Center Graphic / Video Preview Mock */}
              <div className="my-auto text-center py-6">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-tr from-lime-400/20 to-emerald-500/20 border border-lime-400/30 flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform">
                  <Film className="w-10 h-10 text-lime-400" />
                </div>
                <div className="mt-4 text-sm font-medium text-white">9:16 Vertical Reel Studio</div>
                <div className="text-xs text-gray-400 mt-1">Word-by-word karaoke & blurred background</div>
              </div>

              {/* Bottom Metric Card */}
              <div className="bg-[#1c2822]/90 border border-white/10 rounded-2xl p-4 backdrop-blur-md shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">ACCURACY SCORE</span>
                  <span className="text-lime-400 font-bold text-sm">99.8%</span>
                </div>
                <div className="flex items-center gap-1">
                  {[40, 70, 95, 80, 100, 85, 90, 95, 70, 85].map((val, i) => (
                    <div key={i} className="flex-1 bg-white/10 h-6 rounded-sm overflow-hidden flex items-end">
                      <div className="w-full bg-lime-400/80 rounded-sm" style={{ height: `${val}%` }}></div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Bottom Spec Bar */}
        <div className="mt-20 pt-8 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-lime-400 font-bold text-lg">⚡ Groq Whisper V3</div>
            <div className="text-xs text-gray-400 mt-1">Sub-second transcription speed</div>
          </div>
          <div>
            <div className="text-lime-400 font-bold text-lg">🎬 9:16 Auto Vertical</div>
            <div className="text-xs text-gray-400 mt-1">Perfect fit for Reels & TikTok</div>
          </div>
          <div>
            <div className="text-lime-400 font-bold text-lg">✨ Karaoke Highlights</div>
            <div className="text-xs text-gray-400 mt-1">Dynamic word-by-word color pop</div>
          </div>
          <div>
            <div className="text-lime-400 font-bold text-lg">🌐 Hinglish & Hindi</div>
            <div className="text-xs text-gray-400 mt-1">Flawless Roman script translation</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-6 py-24 border-t border-white/10 relative z-10 max-w-7xl">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">
            Engineered for <span className="font-serif italic font-normal text-lime-400">Viral</span> Growth
          </h2>
          <p className="text-gray-400 text-base">Everything top creators use to hook viewers in the first 3 seconds.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-8 rounded-3xl bg-[#141c18]/60 border border-white/10 hover:border-lime-400/40 transition-all group backdrop-blur-md">
            <div className="w-12 h-12 bg-lime-400/10 rounded-2xl flex items-center justify-center mb-6 border border-lime-400/20 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6 text-lime-400" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">AI Whisper Large V3</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Blazing fast speech-to-text with precise timestamps, auto emoji insertion, and punctuation cleanup.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-[#141c18]/60 border border-white/10 hover:border-lime-400/40 transition-all group backdrop-blur-md">
            <div className="w-12 h-12 bg-lime-400/10 rounded-2xl flex items-center justify-center mb-6 border border-lime-400/20 group-hover:scale-110 transition-transform">
              <Film className="w-6 h-6 text-lime-400" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Creator Font Presets</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Instantly style captions with Montserrat, Bangers, Permanent Marker, and Caveat with custom outlines & shadows.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-[#141c18]/60 border border-white/10 hover:border-lime-400/40 transition-all group backdrop-blur-md">
            <div className="w-12 h-12 bg-lime-400/10 rounded-2xl flex items-center justify-center mb-6 border border-lime-400/20 group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6 text-lime-400" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Blurred Backgrounds</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Transform horizontal videos into professional 9:16 vertical clips with gorgeous blurred video backgrounds.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#0a0f0d] py-12">
        <div className="container mx-auto px-6 max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Logo className="w-8 h-8" size={18} />
            <span className="font-bold text-white">CaptionForge</span>
          </div>
          <p className="text-xs text-gray-500">
            © 2026 CaptionForge AI. Inspired by elite organic design. Empowering creators worldwide.
          </p>
        </div>
      </footer>
    </main>
  )
}
