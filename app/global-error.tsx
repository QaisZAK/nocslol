'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen bg-lol-gradient flex items-center justify-center px-4">
          <div className="lol-card p-12 text-center max-w-md mx-auto">
            <AlertTriangle className="w-16 h-16 text-lol-red mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-lol-gold mb-4">Something went wrong!</h1>
            <p className="text-lol-accent/80 mb-6">
              We encountered an unexpected error. Please try refreshing the page or returning to the home page.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={reset}
                className="lol-button flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              
              <Link href="/" className="lol-button-secondary flex items-center justify-center gap-2">
                <Home className="w-4 h-4" />
                Go Home
              </Link>
            </div>
            
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6 text-left">
                <summary className="text-lol-red cursor-pointer text-sm">Error Details (Dev)</summary>
                <pre className="mt-2 text-xs text-lol-accent/60 bg-lol-dark/50 p-3 rounded overflow-auto">
                  {error.message}
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      </body>
    </html>
  )
}
