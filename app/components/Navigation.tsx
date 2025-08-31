'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Sword, Zap, Users, Upload, BookOpen, ExternalLink } from 'lucide-react'

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

            const navigation = [
            { name: 'Live', href: '/live-game', icon: Zap },
            { name: 'Champions', href: '/champions', icon: Users },
            { name: 'Guide', href: '/cs-mechanics', icon: BookOpen },
            { name: 'Submit', href: '/submit-info', icon: Upload },
          ]

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className="bg-lol-darker/95 backdrop-blur-sm border-b border-lol-gold/30 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-lol-gold to-yellow-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Sword className="w-6 h-6 text-lol-dark" />
            </div>
            <div>
              <span className="text-2xl font-bold text-lol-gold group-hover:text-glow transition-all">
                NoCSLOL
              </span>
              <p className="text-xs text-lol-accent/60 -mt-1">No Creep Score Challenge</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const isLive = item.name === 'Live'
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isLive
                      ? 'text-lol-gold border border-lol-gold/50 hover:bg-lol-gold/20'
                      : isActive(item.href)
                      ? 'bg-lol-gold text-lol-dark border border-lol-gold'
                      : 'text-lol-accent hover:bg-lol-gold/20 hover:text-lol-gold border border-transparent hover:border-lol-gold/30'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              )
            })}
            
            {/* Twitch Link */}
            <a
              href="https://www.twitch.tv/bardinette"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 text-purple-400 hover:bg-purple-500/20 hover:text-purple-300 border border-transparent hover:border-purple-500/30"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
              </svg>
              <span className="font-medium">Bardinette 💜</span>
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-lol-accent hover:text-lol-gold transition-colors p-2"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-lol-gold/20 bg-lol-darker/95">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isLive = item.name === 'Live'
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                      isLive
                        ? 'text-lol-gold border border-lol-gold/50 hover:bg-lol-gold/20'
                        : isActive(item.href)
                        ? 'bg-lol-gold text-lol-dark border border-lol-gold'
                        : 'text-lol-accent hover:bg-lol-gold/20 hover:text-lol-gold border border-transparent hover:border-lol-gold/30'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                )
              })}
              
              {/* Twitch Link - Mobile */}
              <a
                href="https://www.twitch.tv/bardinette"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 text-purple-400 hover:bg-purple-500/20 hover:text-purple-300 border border-transparent hover:border-purple-500/30"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
                </svg>
                <span className="font-medium">Bardinette 💜</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
