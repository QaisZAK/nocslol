'use client'

import Link from 'next/link'
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-lol-gradient flex items-center justify-center px-4">
      <div className="lol-card p-12 text-center max-w-md mx-auto">
        <AlertTriangle className="w-16 h-16 text-lol-red mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-lol-gold mb-4">404</h1>
        <h2 className="text-2xl font-bold text-lol-accent mb-4">Page Not Found</h2>
        <p className="text-lol-accent/80 mb-8">
          The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="lol-button flex items-center justify-center gap-2">
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="lol-button-secondary flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}
