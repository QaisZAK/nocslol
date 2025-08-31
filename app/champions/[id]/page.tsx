'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, AlertTriangle, CheckCircle, XCircle, Info, Shield, Zap, Target, Sword } from 'lucide-react'
import { getAbilityImageUrl, getPassiveImageUrl } from '../../champion-image-filenames'

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
    const givesCSAbilities = champion.csMechanics.abilities.filter(ability => ability.givesCS)
    const passiveGivesCS = champion.csMechanics.passive.givesCS
    const totalAbilities = champion.csMechanics.abilities.length + 1 // +1 for passive
    
    return {
      givesCS: givesCSAbilities.length + (passiveGivesCS ? 1 : 0),
      noCS: totalAbilities - (givesCSAbilities.length + (passiveGivesCS ? 1 : 0)),
      total: totalAbilities
    }
  }

  const csStats = getCSStats()
  const isSafeChampion = csStats.givesCS === 0

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
          
          <div className="flex items-center gap-6">
            <img
              src={`https://ddragon.leagueoflegends.com/cdn/15.17.1/img/champion/${champion.id}.png`}
              alt={champion.name}
              className="w-24 h-24 rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
              }}
            />
            <div>
              <h1 className="text-5xl font-bold text-lol-gold mb-2 text-shadow">
                {champion.name}
              </h1>
              <p className="text-xl text-lol-accent/80 italic">
                {champion.title}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Quick Status Card */}
        <div className="mb-8">
          <div className={`lol-card p-6 text-center ${isSafeChampion ? 'border-lol-green/50 bg-lol-green/5' : 'border-lol-red/50 bg-lol-red/5'}`}>
            <div className="flex items-center justify-center gap-4 mb-4">
              {isSafeChampion ? (
                <CheckCircle className="w-12 h-12 text-lol-green" />
              ) : (
                <AlertTriangle className="w-12 h-12 text-lol-red" />
              )}
              <div>
                <h2 className={`text-3xl font-bold ${isSafeChampion ? 'text-lol-green' : 'text-lol-red'}`}>
                  {isSafeChampion ? 'SAFE TO PLAY AGAINST' : 'DANGEROUS - WATCH OUT!'}
                </h2>
                <p className="text-lol-accent/80 text-lg">
                  {isSafeChampion 
                    ? `${champion.name} has no abilities that give CS. You're safe!`
                    : `${champion.name} has ${csStats.givesCS} ability${csStats.givesCS > 1 ? 's' : ''} that give${csStats.givesCS > 1 ? '' : 's'} CS.`
                  }
                </p>
              </div>
            </div>
            
            {/* CS Stats */}
            <div className="grid grid-cols-3 gap-6 max-w-md mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-lol-red">{csStats.givesCS}</div>
                <div className="text-sm text-lol-accent/70">Gives CS</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-lol-green">{csStats.noCS}</div>
                <div className="text-sm text-lol-accent/70">Safe</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-lol-gold">{csStats.total}</div>
                <div className="text-sm text-lol-accent/70">Total</div>
              </div>
            </div>
          </div>
        </div>

        {/* Abilities Grid */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-lol-gold mb-6 text-center">Abilities Breakdown</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Passive */}
            <div className={`lol-card p-6 ${champion.csMechanics.passive.givesCS ? 'border-lol-red/50 bg-lol-red/5' : 'border-lol-green/50 bg-lol-green/5'}`}>
              <div className="text-center mb-4">
                <img
                  src={getPassiveImageUrl(champion.id)}
                  alt={`${champion.name} Passive`}
                  className="w-16 h-16 mx-auto mb-3 rounded"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
                <h3 className="text-xl font-bold text-lol-gold">Passive</h3>
                <h4 className="text-lg font-semibold text-lol-accent mb-2">
                  {champion.csMechanics.passive.name}
                </h4>
              </div>
              
              <div className={`px-3 py-2 rounded-full text-sm font-medium text-center mb-4 ${
                champion.csMechanics.passive.givesCS 
                  ? 'bg-lol-red/20 text-lol-red border border-lol-red/30' 
                  : 'bg-lol-green/20 text-lol-green border border-lol-green/30'
              }`}>
                {champion.csMechanics.passive.givesCS ? '⚠️ GIVES CS' : '✅ SAFE'}
              </div>
              
              <p className="text-lol-accent/80 text-sm mb-3 leading-relaxed">
                {champion.csMechanics.passive.description}
              </p>
              
              {champion.csMechanics.passive.notes.trim() !== "" && (
                <div className="bg-lol-dark/50 rounded p-3 border-l border-lol-gold/30">
                  <p className="text-xs text-lol-accent/80">
                    <strong className="text-lol-gold">Note:</strong> {champion.csMechanics.passive.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Abilities */}
            {champion.csMechanics.abilities.map((ability, index) => (
              <div key={index} className={`lol-card p-6 ${ability.givesCS ? 'border-lol-red/50 bg-lol-red/5' : 'border-lol-green/50 bg-lol-green/5'}`}>
                <div className="text-center mb-4">
                  <img
                    src={getAbilityImageUrl(champion.id, ability.key)}
                    alt={`${champion.name} ${ability.key}`}
                    className="w-16 h-16 mx-auto mb-3 rounded"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                  <h3 className="text-xl font-bold text-lol-gold">{ability.key}</h3>
                  <h4 className="text-lg font-semibold text-lol-accent mb-2">
                    {ability.name}
                  </h4>
                </div>
                
                <div className={`px-3 py-2 rounded-full text-sm font-medium text-center mb-4 ${
                  ability.givesCS 
                    ? 'bg-lol-red/20 text-lol-red border border-lol-red/30' 
                    : 'bg-lol-green/20 text-lol-green border border-lol-green/30'
                }`}>
                  {ability.givesCS ? '⚠️ GIVES CS' : '✅ SAFE'}
                </div>
                
                <p className="text-lol-accent/80 text-sm mb-3 leading-relaxed">
                  {ability.description}
                </p>
                
                {ability.notes.trim() !== "" && (
                  <div className="bg-lol-dark/50 rounded p-3 border-l border-lol-gold/30">
                    <p className="text-xs text-lol-accent/80">
                      <strong className="text-lol-gold">Note:</strong> {ability.notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Strategy Summary */}
        <div className="lol-card p-6">
          <h2 className="text-2xl font-bold text-lol-gold mb-4 text-center flex items-center justify-center">
            <Target className="w-6 h-6 mr-2" />
            Strategy Summary
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* What to Watch Out For */}
            <div className="bg-lol-red/10 border border-lol-red/30 rounded-lg p-4">
              <h3 className="text-lol-red font-bold text-lg mb-3 flex items-center">
                <XCircle className="w-5 h-5 mr-2" />
                ⚠️ Watch Out For
              </h3>
              {champion.csMechanics.abilities.filter(ability => ability.givesCS).length > 0 || champion.csMechanics.passive.givesCS ? (
                <ul className="space-y-2">
                  {champion.csMechanics.abilities
                    .filter(ability => ability.givesCS)
                    .map((ability, index) => (
                      <li key={index} className="flex items-center gap-2 text-lol-accent/90">
                        <img 
                          src={getAbilityImageUrl(champion.id, ability.key)} 
                          alt={ability.key}
                          className="w-6 h-6 rounded"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                        <span><strong>{ability.key}</strong> - {ability.name}</span>
                      </li>
                    ))}
                  {champion.csMechanics.passive.givesCS && (
                    <li className="flex items-center gap-2 text-lol-accent/90">
                      <img 
                        src={getPassiveImageUrl(champion.id)} 
                        alt="Passive"
                        className="w-6 h-6 rounded"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                      <span><strong>Passive</strong> - {champion.csMechanics.passive.name}</span>
                    </li>
                  )}
                </ul>
              ) : (
                <p className="text-lol-green font-medium">🎉 Nothing to worry about!</p>
              )}
            </div>
            
            {/* Safe */}
            <div className="bg-lol-green/10 border border-lol-green/30 rounded-lg p-4">
              <h3 className="text-lol-green font-bold text-lg mb-3 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                ✅ Safe
              </h3>
              <ul className="space-y-2">
                {champion.csMechanics.abilities
                  .filter(ability => !ability.givesCS)
                  .map((ability, index) => (
                    <li key={index} className="flex items-center gap-2 text-lol-accent/90">
                      <img 
                        src={getAbilityImageUrl(champion.id, ability.key)} 
                        alt={ability.key}
                        className="w-6 h-6 rounded"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                      <span><strong>{ability.key}</strong> - {ability.name}</span>
                    </li>
                  ))}
                {!champion.csMechanics.passive.givesCS && (
                  <li className="flex items-center gap-2 text-lol-accent/90">
                    <img 
                      src={getPassiveImageUrl(champion.id)} 
                      alt="Passive"
                      className="w-6 h-6 rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                    <span><strong>Passive</strong> - {champion.csMechanics.passive.name}</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
