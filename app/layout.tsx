import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from './components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NoCSLOL - No Creep Score League of Legends Challenge',
  description: 'Master the art of playing League of Legends without getting any creep score. Learn which abilities and actions give CS and which don\'t.',
  keywords: 'League of Legends, No CS, Challenge, Gaming, LoL',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-lol-dark">
          <Navigation />
          {children}
        </div>
      </body>
    </html>
  )
}
