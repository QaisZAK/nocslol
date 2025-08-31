'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle, XCircle, Info, Target, Shield, Eye, Sword, Zap } from 'lucide-react'

interface CSMechanics {
  generalCSMechanics: {
    objectives: {
      name: string
      givesCS: boolean
      description: string
      notes: string
    }[]
    structures: {
      name: string
      givesCS: boolean
      description: string
      notes: string
    }[]
    vision: {
      name: string
      givesCS: boolean
      description: string
      notes: string
    }[]
    minions: {
      name: string
      givesCS: boolean
      description: string
      notes: string
    }[]
    monsters: {
      name: string
      givesCS: boolean
      description: string
      notes: string
    }[]
    specialCases: {
      name: string
      givesCS: boolean
      description: string
      notes: string
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

  const renderCSList = (items: any[], title: string, IconComponent: any, color: string) => (
    <div className="lol-card p-6">
      <h3 className="text-xl font-bold text-lol-gold mb-4 flex items-center">
        <IconComponent className="w-5 h-5 mr-2" />
        {title}
      </h3>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="border border-lol-gold/20 rounded-lg p-3">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-lol-accent">{item.name}</h4>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                item.givesCS 
                  ? 'bg-lol-red/20 text-lol-red border border-lol-red/30' 
                  : 'bg-lol-green/20 text-lol-green border border-lol-green/30'
              }`}>
                {item.givesCS ? 'Gives CS' : 'No CS'}
              </div>
            </div>
            <p className="text-sm text-lol-accent/70 mb-2">{item.description}</p>
            <div className="bg-lol-dark/50 rounded p-2">
              <p className="text-xs text-lol-accent/80">
                <strong>Strategy:</strong> {item.notes}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-lol-dark">
      {/* Header */}
      <div className="bg-lol-darker border-b border-lol-gold/30 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-5xl font-bold text-lol-gold mb-4 text-shadow">
            CS Mechanics Guide
          </h1>
          <p className="text-xl text-lol-accent/80">
            Complete guide to what gives and doesn't give CS in League of Legends
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* General Strategies */}
        <div className="lol-card p-6 mb-8">
          <h2 className="text-2xl font-bold text-lol-gold mb-6 flex items-center">
            <Zap className="w-6 h-6 mr-3" />
            General NoCS Strategies
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-lol-gold mb-3">Core Principles</h3>
              <ul className="space-y-2">
                {csMechanics.strategies.general.map((strategy, index) => (
                  <li key={index} className="flex items-start gap-2 text-lol-accent/80">
                    <CheckCircle className="w-4 h-4 text-lol-green mt-0.5 flex-shrink-0" />
                    <span>{strategy}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-lol-gold mb-3">Objective Strategy</h3>
              <ul className="space-y-2">
                {csMechanics.strategies.objectives.map((strategy, index) => (
                  <li key={index} className="flex items-start gap-2 text-lol-accent/80">
                    <Target className="w-4 h-4 text-lol-gold mt-0.5 flex-shrink-0" />
                    <span>{strategy}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Objectives */}
            {renderCSList(
              csMechanics.generalCSMechanics.objectives,
              'Objectives',
              Target,
              'lol-red'
            )}

            {/* Structures */}
            {renderCSList(
              csMechanics.generalCSMechanics.structures,
              'Structures',
              Shield,
              'lol-green'
            )}

            {/* Vision */}
            {renderCSList(
              csMechanics.generalCSMechanics.vision,
              'Vision Control',
              Eye,
              'lol-green'
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Minions */}
            {renderCSList(
              csMechanics.generalCSMechanics.minions,
              'Minions',
              Sword,
              'lol-red'
            )}

            {/* Jungle Monsters */}
            {renderCSList(
              csMechanics.generalCSMechanics.monsters,
              'Jungle Monsters',
              Target,
              'lol-red'
            )}
          </div>
        </div>

        {/* Vision Strategy */}
        <div className="lol-card p-6 mt-8">
          <h2 className="text-xl font-bold text-lol-gold mb-4 flex items-center">
            <Eye className="w-5 h-5 mr-2" />
            Vision Control Strategy
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {csMechanics.strategies.vision.map((strategy, index) => (
              <div key={index} className="bg-lol-dark/50 rounded-lg p-4 border-l border-lol-gold/30">
                <p className="text-lol-accent/90 text-sm">
                  {strategy}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Important Notes */}
        <div className="lol-card p-6 mt-8 border-2 border-lol-red/30">
          <h2 className="text-xl font-bold text-lol-red mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Critical NoCS Rules
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-lol-red mt-0.5 flex-shrink-0" />
              <p className="text-lol-accent/90">
                <strong>Never kill minions</strong> - All minion types give CS when killed
              </p>
            </div>
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-lol-red mt-0.5 flex-shrink-0" />
              <p className="text-lol-accent/90">
                <strong>Avoid objective last hits</strong> - Let teammates secure objectives to avoid CS gain
              </p>
            </div>
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-lol-red mt-0.5 flex-shrink-0" />
              <p className="text-lol-accent/90">
                <strong>Watch for special cases</strong> - Some champion abilities (like Jhin flowers) give CS
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-lol-green mt-0.5 flex-shrink-0" />
              <p className="text-lol-accent/90">
                <strong>Safe activities:</strong> Destroying wards, towers, and structures does NOT give CS
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
