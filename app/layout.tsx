import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CaptionForge - AI Video Captioning for Creators",
  description: "Add professional animated captions to your videos in minutes. Perfect for Instagram Reels, YouTube Shorts, and TikTok.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Anton&family=Bangers&family=Caveat:wght@600;700&family=Inter:wght@400;600;700;800;900&family=Montserrat:wght@700;800;900&family=Pacifico&family=Permanent+Marker&family=Poppins:wght@600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.className} bg-gray-950 text-gray-100`}>
        {children}
      </body>
    </html>
  );
}
