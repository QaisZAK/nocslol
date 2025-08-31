'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, AlertTriangle, CheckCircle, XCircle, Info, Shield, Zap, Target } from 'lucide-react'

interface Champion {
  id: string
  name: string
  title: string
  blurb: string
  image: string
  csMechanics: {
    abilities: {
      key: string
      name: string
      givesCS: boolean
      description: string
      notes: string
    }[]
    passive: {
      name: string
      givesCS: boolean
      description: string
      notes: string
    }
    strategy: string
  }
}

export default function ChampionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [champion, setChampion] = useState<Champion | null>(null)
  const [loading, setLoading] = useState(true)
  const [championId, setChampionId] = useState<string>('')

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setChampionId(resolvedParams.id)
    }
    getParams()
  }, [params])

  useEffect(() => {
    if (!championId) return

    const fetchChampion = async () => {
      try {
        const response = await fetch('/data/champions.json')
        const data = await response.json()
        const foundChampion = data.champions.find((c: Champion) => c.id === championId)
        setChampion(foundChampion || null)
      } catch (error) {
        console.error('Error loading champion:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchChampion()
  }, [championId])

  if (loading) {
    return (
      <div className="min-h-screen bg-lol-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-lol-gold mx-auto mb-4"></div>
          <p className="text-lol-accent text-xl">Loading champion...</p>
        </div>
      </div>
    )
  }

  if (!champion) {
    return (
      <div className="min-h-screen bg-lol-dark flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-lol-red mb-4">Champion Not Found</h1>
          <p className="text-lol-accent mb-6">The champion you're looking for doesn't exist.</p>
          <Link href="/champions" className="lol-button">
            <ArrowLeft className="inline-block w-5 h-5 mr-2" />
            Back to Champions
          </Link>
        </div>
      </div>
    )
  }

  const getCSStats = () => {
    // Playing AGAINST: What to watch out for
    const givesCSAbilities = champion.csMechanics.abilities.filter(ability => ability.givesCS)
    const passiveGivesCS = champion.csMechanics.passive.givesCS
    
    return {
      givesCS: givesCSAbilities.length + (passiveGivesCS ? 1 : 0),
      noCS: 0,
      total: givesCSAbilities.length + (passiveGivesCS ? 1 : 0)
    }
  }

  const csStats = getCSStats()

  const getStrategy = () => {
    // Generate strategy for playing against
    const givesCSAbilities = champion.csMechanics.abilities.filter(ability => ability.givesCS)
    const passiveGivesCS = champion.csMechanics.passive.givesCS
    
    if (givesCSAbilities.length === 0 && !passiveGivesCS) {
      return `${champion.name} is safe to play against - they have no abilities that give CS. You can engage freely without worrying about accidentally gaining CS.`
    } else {
      let dangerousItems = []
      
      if (givesCSAbilities.length > 0) {
        dangerousItems.push(...givesCSAbilities.map(ability => `${ability.key} - ${ability.name}`))
      }
      
      if (passiveGivesCS) {
        dangerousItems.push('passive')
      }
      
      if (dangerousItems.length === 0) {
        return `${champion.name} is safe to play against - they have no abilities that give CS.`
      }
      
      const dangerousAbilities = dangerousItems.join(', ')
      return `When playing against ${champion.name}, be careful of: ${dangerousAbilities}. These can give you CS if you're not careful. Focus on avoiding these abilities and attacks to maintain your NoCS challenge.`
    }
  }

  return (
    <div className="min-h-screen bg-lol-dark">
      {/* Header */}
      <div className="bg-lol-darker border-b border-lol-gold/30 py-6">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <Link href="/champions" className="inline-flex items-center text-lol-accent hover:text-lol-gold transition-colors">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Champions
            </Link>
          </div>
          
          <h1 className="text-5xl font-bold text-lol-gold mb-2 text-shadow">
            {champion.name}
          </h1>
          <p className="text-xl text-lol-accent/80 italic">
            {champion.title}
          </p>

        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Champion Info */}
          <div className="lg:col-span-1">
            <div className="lol-card p-6 mb-6">
              <img
                src={champion.image}
                alt={champion.name}
                className="w-full rounded-lg mb-4"
              />
              
              {/* CS Summary Stats */}
              <div className="space-y-4">
                <div className="text-center p-4 bg-lol-dark/50 rounded-lg">
                  <h3 className="text-lg font-bold text-lol-gold mb-2">
                    CS Summary
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-lol-red">{csStats.givesCS}</div>
                      <div className="text-sm text-lol-accent/70">
                        Gives CS
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-lol-green">{csStats.noCS}</div>
                      <div className="text-sm text-lol-accent/70">No CS</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Strategy */}
            {getStrategy().trim() !== "" && (
              <div className="lol-card p-6">
                <h3 className="text-xl font-bold text-lol-gold mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Strategy
                </h3>
                <div className="bg-lol-dark/50 rounded p-4 border-l border-lol-gold/30">
                  <p className="text-lol-accent/90 leading-relaxed">
                    {getStrategy()}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Abilities and CS Mechanics */}
          <div className="lg:col-span-2">
            {/* Passive */}
            <div className="lol-card p-6 mb-6">
              <h3 className="text-2xl font-bold text-lol-gold mb-6 flex items-center">
                <Shield className="w-6 h-6 mr-3" />
                Passive Ability
              </h3>
              
              <div className="border border-lol-gold/20 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-lg font-semibold text-lol-accent">
                      {champion.csMechanics.passive.name}
                    </h4>
                    <p className="text-lol-accent/70 text-sm mt-1">
                      {champion.csMechanics.passive.description}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    champion.csMechanics.passive.givesCS 
                      ? 'bg-lol-red/20 text-lol-red border border-lol-red/30' 
                      : 'bg-lol-green/20 text-lol-green border border-lol-green/30'
                  }`}>
                    {champion.csMechanics.passive.givesCS ? 'Gives CS' : 'No CS'}
                  </div>
                </div>
                
                {champion.csMechanics.passive.notes.trim() !== "" && (
                  <div className="bg-lol-dark/50 rounded p-3">
                    <p className="text-sm text-lol-accent/80">
                      <strong>
                        Strategy:
                      </strong> {champion.csMechanics.passive.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Abilities */}
            <div className="lol-card p-6 mb-6">
              <h3 className="text-2xl font-bold text-lol-gold mb-6 flex items-center">
                <Zap className="w-6 h-6 mr-3" />
                Abilities & CS Mechanics
              </h3>
              
              <div className="space-y-6">
                {champion.csMechanics.abilities.map((ability, index) => (
                  <div key={index} className="border border-lol-gold/20 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-lg font-semibold text-lol-accent">
                          {ability.key} - {ability.name}
                        </h4>
                        <p className="text-lol-accent/70 text-sm mt-1">
                          {ability.description}
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        ability.givesCS 
                          ? 'bg-lol-red/20 text-lol-red border border-lol-red/30' 
                          : 'bg-lol-green/20 text-lol-green border border-lol-green/30'
                      }`}>
                        {ability.givesCS ? 'Gives CS' : 'No CS'}
                      </div>
                    </div>
                    
                    {ability.notes.trim() !== "" && (
                      <div className="bg-lol-dark/50 rounded p-3">
                        <p className="text-sm text-lol-accent/80">
                          <strong>
                            Strategy:
                          </strong> {ability.notes}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Reference */}
            <div className="lol-card p-6">
              <h3 className="text-xl font-bold text-lol-gold mb-4 flex items-center">
                <Info className="w-5 h-5 mr-2" />
                Quick Reference
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-lol-red/10 border border-lol-red/30 rounded-lg p-4">
                  <h4 className="text-lol-red font-semibold mb-2 flex items-center">
                    <XCircle className="w-4 h-4 mr-2" />
                    Watch Out For (Gives CS)
                  </h4>
                  <ul className="space-y-1 text-sm text-lol-accent/80">
                    {champion.csMechanics.abilities
                      .filter(ability => ability.givesCS)
                      .map((ability, index) => (
                        <li key={index} className="pl-4">• {ability.key} - {ability.name}</li>
                      ))}
                    {champion.csMechanics.passive.givesCS && (
                      <li className="pl-4">• {champion.csMechanics.passive.name}</li>
                    )}
                    {champion.csMechanics.abilities.filter(ability => ability.givesCS).length === 0 && 
                     !champion.csMechanics.passive.givesCS && (
                      <li className="pl-4 text-lol-green">• This champion is safe - no CS-gaining abilities</li>
                    )}
                  </ul>
                </div>
                
                <div className="bg-lol-green/10 border border-lol-green/30 rounded-lg p-4">
                  <h4 className="text-lol-green font-semibold mb-2 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Safe to Use (No CS)
                  </h4>
                  <ul className="space-y-1 text-sm text-lol-accent/80">
                    {champion.csMechanics.abilities
                      .filter(ability => !ability.givesCS)
                      .map((ability, index) => (
                        <li key={index} className="pl-4">• {ability.key} - {ability.name}</li>
                      ))}
                    {!champion.csMechanics.passive.givesCS && (
                      <li className="pl-4">• {champion.csMechanics.passive.name} (safe)</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
