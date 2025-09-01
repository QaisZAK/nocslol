'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle, XCircle, Info, Target, Shield, Eye, Sword, Zap, Crown, MapPin, TreePine, Building2, Gem, Skull, Flame, Ban, ShieldCheck, ChevronDown, ChevronRight } from 'lucide-react'

interface CSMechanics {
  generalCSMechanics: {
    objectives: {
      name: string
      givesCS: boolean
      description: string
      notes: string
      image?: string
    }[]
    structures: {
      name: string
      givesCS: boolean
      description: string
      notes: string
      image?: string
    }[]
    vision: {
      name: string
      givesCS: boolean
      description: string
      notes: string
      image?: string
    }[]
    minions: {
      name: string
      givesCS: boolean
      description: string
      notes: string
      image?: string
    }[]
    monsters: {
      name: string
      givesCS: boolean
      description: string
      notes: string
      image?: string
    }[]
    specialCases: {
      name: string
      givesCS: boolean
      description: string
      notes: string
      image?: string
    }[]
  }
  strategies: {
    general: string[]
    objectives: string[]
    vision: string[]
  }
}

export default function CSMechanicsPage() {
  const [csMechanics, setCsMechanics] = useState<CSMechanics | null>(null)
  const [loading, setLoading] = useState(true)
  const [collapsedSections, setCollapsedSections] = useState<{[key: string]: boolean}>({
    dangerous: false,
    safe: false,
    tips: false
  })

  useEffect(() => {
    const fetchCSMechanics = async () => {
      try {
        const response = await fetch('/data/cs-mechanics.json')
        const data = await response.json()
        setCsMechanics(data)
      } catch (error) {
        console.error('Error loading CS mechanics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCSMechanics()
  }, [])

  const toggleSection = (sectionKey: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-lol-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-lol-gold mx-auto mb-4"></div>
          <p className="text-lol-accent text-xl">Loading CS mechanics...</p>
        </div>
      </div>
    )
  }

  if (!csMechanics) {
    return (
      <div className="min-h-screen bg-lol-dark flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-lol-red mb-4">Error Loading Data</h1>
          <p className="text-lol-accent mb-6">Failed to load CS mechanics information.</p>
        </div>
      </div>
    )
  }

  const renderItemCard = (item: any, index: number) => (
    <div key={index} className={`border rounded-lg p-4 ${
      item.givesCS 
        ? 'border-lol-red/30 bg-lol-red/10' 
        : 'border-lol-green/30 bg-lol-green/10'
    }`}>
      <div className="flex items-start gap-4">
        {/* Image Section */}
        {item.image && (
          <div className="flex-shrink-0">
            <img
              src={`/images/cs-mechanics/${item.image}`}
              alt={item.name}
              className="w-16 h-16 rounded-lg border-2 border-lol-gold/30 shadow-lg"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>
        )}
        
        {/* Content Section */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-semibold text-lol-accent text-base">{item.name}</h4>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              item.givesCS 
                ? 'bg-lol-red/20 text-lol-red border border-lol-red/30' 
                : 'bg-lol-green/20 text-lol-green border border-lol-green/30'
            }`}>
              {item.givesCS ? '⚠️ GIVES CS' : '✅ SAFE'}
            </div>
          </div>
          <p className="text-sm text-lol-accent/80 mb-2 leading-relaxed">{item.description}</p>
          {item.notes && item.notes.trim() !== "" && (
            <div className="bg-lol-dark/50 rounded p-2 border-l border-lol-gold/30">
              <p className="text-xs text-lol-accent/80">
                <strong className="text-lol-gold">Strategy:</strong> {item.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-lol-dark">
      {/* Hero Header */}
      <div className="bg-lol-darker border-b border-lol-gold/30 py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-lol-gold/20 rounded-full mb-4">
              <Target className="w-10 h-10 text-lol-gold" />
            </div>
            <h1 className="text-6xl font-bold text-lol-gold mb-4 text-shadow">
              CS Mechanics Guide
            </h1>
            <p className="text-xl text-lol-accent/80 max-w-3xl mx-auto">
              Master the art of playing with ZERO creep score. Know what to avoid and what's safe to interact with.
            </p>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="bg-lol-dark/50 rounded-lg p-4 border border-lol-gold/30">
              <div className="text-2xl font-bold text-lol-red">❌</div>
              <div className="text-sm text-lol-accent/70">Avoid These</div>
            </div>
            <div className="bg-lol-dark/50 rounded-lg p-4 border border-lol-gold/30">
              <div className="text-2xl font-bold text-lol-green">✅</div>
              <div className="text-sm text-lol-accent/70">Safe to Use</div>
            </div>
            <div className="bg-lol-dark/50 rounded-lg p-4 border border-lol-gold/30">
              <div className="text-2xl font-bold text-lol-gold">🎯</div>
              <div className="text-sm text-lol-accent/70">Master NoCS</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Main Content - Organized in Clear Sections */}
        <div className="space-y-6">
          
          {/* Section 1: What GIVES CS (Dangerous Items) */}
          <div className="lol-card border-2 border-lol-red/30 bg-lol-red/5 overflow-hidden">
            <button 
              onClick={() => toggleSection('dangerous')}
              className="w-full p-6 text-left hover:bg-lol-red/10 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-lol-red/20 rounded-lg">
                    <Ban className="w-6 h-6 text-lol-red" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-lol-red">What GIVES CS - AVOID THESE</h2>
                    <p className="text-lol-accent/70">These items will increase your creep score when killed or destroyed</p>
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-lol-red/20">
                  {collapsedSections.dangerous ? (
                    <ChevronRight className="w-5 h-5 text-lol-red" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-lol-red" />
                  )}
                </div>
              </div>
            </button>
            
            {!collapsedSections.dangerous && (
              <div className="px-6 pb-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Objectives */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-lol-red flex items-center gap-2">
                      <Crown className="w-5 h-5" />
                      Objectives
                    </h3>
                    <div className="space-y-3">
                      {csMechanics.generalCSMechanics.objectives?.map((item, index) => renderItemCard(item, index))}
                    </div>
                  </div>

                  {/* Minions */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-lol-red flex items-center gap-2">
                      <Sword className="w-5 h-5" />
                      Minions
                    </h3>
                    <div className="space-y-3">
                      {csMechanics.generalCSMechanics.minions?.map((item, index) => renderItemCard(item, index))}
                    </div>
                  </div>
                </div>

                {/* Monsters Row */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-lol-red flex items-center gap-2 mb-4">
                    <TreePine className="w-5 h-5" />
                    Jungle Monsters
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {csMechanics.generalCSMechanics.monsters?.map((item, index) => renderItemCard(item, index))}
                  </div>
                </div>

                {/* Vision Row */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-lol-red flex items-center gap-2 mb-4">
                    <Eye className="w-5 h-5" />
                    Vision Control
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {csMechanics.generalCSMechanics.vision?.map((item, index) => renderItemCard(item, index))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: What's SAFE (Doesn't Give CS) */}
          <div className="lol-card border-2 border-lol-green/30 bg-lol-green/5 overflow-hidden">
            <button 
              onClick={() => toggleSection('safe')}
              className="w-full p-6 text-left hover:bg-lol-green/10 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-lol-green/20 rounded-lg">
                    <ShieldCheck className="w-6 h-6 text-lol-green" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-lol-green">What's SAFE - Use Freely</h2>
                    <p className="text-lol-accent/70">These items are safe to interact with and won't increase your creep score</p>
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-lol-green/20">
                  {collapsedSections.safe ? (
                    <ChevronRight className="w-5 h-5 text-lol-green" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-lol-green" />
                  )}
                </div>
              </div>
            </button>
            
            {!collapsedSections.safe && (
              <div className="px-6 pb-6">
                <div className="grid md:grid-cols-3 gap-6">
                  {csMechanics.generalCSMechanics.structures?.map((item, index) => renderItemCard(item, index))}
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Pro Tips */}
          <div className="lol-card border-2 border-lol-gold/30 bg-lol-gold/5 overflow-hidden">
            <button 
              onClick={() => toggleSection('tips')}
              className="w-full p-6 text-left hover:bg-lol-gold/10 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-lol-gold/20 rounded-lg">
                    <Flame className="w-6 h-6 text-lol-gold" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-lol-gold">Pro NoCS Tips</h2>
                    <p className="text-lol-accent/70">Advanced strategies and advice for mastering the NoCS challenge</p>
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-lol-gold/20">
                  {collapsedSections.tips ? (
                    <ChevronRight className="w-5 h-5 text-lol-gold" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-lol-gold" />
                  )}
                </div>
              </div>
            </button>
            
            {!collapsedSections.tips && (
              <div className="px-6 pb-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-lol-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-lol-gold font-bold text-sm">1</span>
                      </div>
                      <p className="text-lol-accent/90 text-sm">
                        <strong>Position carefully</strong> - Stay away from minion waves and jungle camps
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-lol-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-lol-gold font-bold text-sm">2</span>
                      </div>
                      <p className="text-lol-accent/90 text-sm">
                        <strong>Communicate</strong> - Let your team know you're doing NoCS challenge
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-lol-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-lol-gold font-bold text-sm">3</span>
                      </div>
                      <p className="text-lol-accent/90 text-sm">
                        <strong>Careful of support item</strong> - Ganking is nice but run like hell after.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-lol-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-lol-gold font-bold text-sm">4</span>
                      </div>
                      <p className="text-lol-accent/90 text-sm">
                        <strong>Track your CS</strong> - Monitor the scoreboard to ensure 0 CS
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
