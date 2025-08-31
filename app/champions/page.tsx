'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Search, AlertTriangle, CheckCircle, XCircle, User, Shield, Filter, SortAsc, SortDesc, Zap, Target, Sword, Eye, Heart } from 'lucide-react'
import { getAbilityImageUrl, getPassiveImageUrl } from '../champion-image-filenames'

interface Champion {
  id: string
  name: string
  title: string
  blurb: string
  image: string
  tags: string[]
  partype: string
  stats: {
    hp: number
    hpperlevel: number
    mp: number
    mpperlevel: number
    movespeed: number
    armor: number
    armorperlevel: number
    spellblock: number
    spellblockperlevel: number
    attackrange: number
    hpregen: number
    hpregenperlevel: number
    mpregen: number
    mpregenperlevel: number
    crit: number
    critperlevel: number
    attackdamage: number
    attackdamageperlevel: number
    attackspeedperlevel: number
    attackspeed: number
  }
  info: {
    attack: number
    defense: number
    magic: number
    difficulty: number
  }
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

type ViewMode = 'against'
type SortField = 'danger' | 'name' | 'difficulty' | 'attack' | 'defense' | 'magic'
type SortOrder = 'asc' | 'desc'

// Role mapping based on tags and stats
const getChampionRole = (champion: Champion): string => {
  const { tags, stats, info } = champion
  
  // Jungle detection based on stats
  const isJungler = stats.movespeed >= 340 && (info.attack >= 7 || info.defense >= 6)
  
  // Support detection
  const isSupport = tags.includes('Support') || (info.magic >= 7 && info.attack <= 4)
  
  // Bot/ADC detection
  const isADC = tags.includes('Marksman') || (info.attack >= 8 && stats.attackrange >= 500)
  
  // Mid detection
  const isMid = tags.includes('Mage') || tags.includes('Assassin') || (info.magic >= 7 && !isSupport)
  
  // Top detection
  const isTop = tags.includes('Fighter') || tags.includes('Tank') || (info.defense >= 6 && !isJungler)
  
  if (isJungler) return 'Jungle'
  if (isSupport) return 'Support'
  if (isADC) return 'Bot'
  if (isMid) return 'Mid'
  if (isTop) return 'Top'
  
  return 'Other'
}

export default function ChampionsPage() {
  const [champions, setChampions] = useState<Champion[]>([])
  const [filteredChampions, setFilteredChampions] = useState<Champion[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const viewMode: ViewMode = 'against'
  
  // Filter states
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [dangerFilter, setDangerFilter] = useState<string>('all') // 'all', 'safe', 'dangerous', 'very-dangerous'
  const [hasStrategy, setHasStrategy] = useState<boolean | null>(null)
  
  // Sort states
  const [sortField, setSortField] = useState<SortField>('danger')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  useEffect(() => {
    const fetchChampions = async () => {
      try {
        const response = await fetch('/data/champions.json')
        const data = await response.json()
        setChampions(data.champions)
        setFilteredChampions(data.champions)
      } catch (error) {
        console.error('Error loading champions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchChampions()
  }, [])

  // Calculate danger level for sorting
  const getDangerLevel = (champion: Champion, mode: ViewMode): number => {
    // Playing AGAINST: Higher danger = more abilities to watch out for
    const givesCSAbilities = champion.csMechanics.abilities.filter(ability => ability.givesCS)
    const passiveGivesCS = champion.csMechanics.passive.givesCS
    return givesCSAbilities.length + (passiveGivesCS ? 1 : 0)
  }

  // Get unique roles and types for filters
  const availableRoles = useMemo(() => {
    const roles = champions.map(getChampionRole)
    return Array.from(new Set(roles)).sort()
  }, [champions])

  const availableTypes = useMemo(() => {
    const types = champions.flatMap(champion => champion.tags)
    return Array.from(new Set(types)).sort()
  }, [champions])

  // Apply filters and sorting
  useEffect(() => {
    let filtered = champions.filter(champion => {
      // Search filter
      const matchesSearch = champion.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           champion.title.toLowerCase().includes(searchTerm.toLowerCase())
      if (!matchesSearch) return false

      // Role filter
      if (selectedRoles.length > 0) {
        const role = getChampionRole(champion)
        if (!selectedRoles.includes(role)) return false
      }

      // Type filter
      if (selectedTypes.length > 0) {
        const hasMatchingType = champion.tags.some(tag => selectedTypes.includes(tag))
        if (!hasMatchingType) return false
      }

      // Danger filter
      if (dangerFilter !== 'all') {
        const dangerLevel = getDangerLevel(champion, viewMode)
        if (dangerFilter === 'safe' && dangerLevel > 0) return false
        if (dangerFilter === 'dangerous' && dangerLevel === 0) return false
      }

      // Strategy filter
      if (hasStrategy !== null) {
        const hasStrategyNotes = champion.csMechanics.strategy.trim() !== "" ||
                               champion.csMechanics.abilities.some(ability => ability.notes.trim() !== "") ||
                               champion.csMechanics.passive.notes.trim() !== ""
        if (hasStrategy !== hasStrategyNotes) return false
      }

      return true
    })

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      if (sortField === 'danger') {
        aValue = getDangerLevel(a, viewMode)
        bValue = getDangerLevel(b, viewMode)
      } else if (sortField === 'name') {
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
      } else if (sortField === 'difficulty') {
        aValue = a.info.difficulty
        bValue = b.info.difficulty
      } else if (sortField === 'attack') {
        aValue = a.info.attack
        bValue = b.info.attack
      } else if (sortField === 'defense') {
        aValue = a.info.defense
        bValue = b.info.defense
      } else if (sortField === 'magic') {
        aValue = a.info.magic
        bValue = b.info.magic
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredChampions(filtered)
  }, [champions, searchTerm, selectedRoles, selectedTypes, dangerFilter, hasStrategy, sortField, sortOrder, viewMode])

  const getCSStats = (champion: Champion, mode: ViewMode) => {
    // Playing AGAINST: What to watch out for
    const givesCSAbilities = champion.csMechanics.abilities.filter(ability => ability.givesCS)
    const passiveGivesCS = champion.csMechanics.passive.givesCS
    
    return {
      givesCS: givesCSAbilities.length + (passiveGivesCS ? 1 : 0),
      noCS: 0, // Not relevant for playing against
      total: givesCSAbilities.length + (passiveGivesCS ? 1 : 0)
    }
  }



  const getStrategyPreview = (champion: Champion, mode: ViewMode) => {
    if (mode === 'against') {
      // Generate strategy for playing against
      const givesCSAbilities = champion.csMechanics.abilities.filter(ability => ability.givesCS)
      const passiveGivesCS = champion.csMechanics.passive.givesCS
      
      if (givesCSAbilities.length === 0 && !passiveGivesCS) {
        return null; // Don't show strategy preview for safe champions
      } else {
        let dangerousItems = []
        
        if (givesCSAbilities.length > 0) {
          dangerousItems.push(...givesCSAbilities.map(ability => ({
            type: 'ability',
            key: ability.key,
            name: ability.name,
            notes: ability.notes,
            image: getAbilityImageUrl(champion.id, ability.key)
          })))
        }
        
        if (passiveGivesCS) {
          dangerousItems.push({
            type: 'passive',
            key: 'P',
            name: 'Passive',
            notes: champion.csMechanics.passive.notes,
            image: getPassiveImageUrl(champion.id)
          })
        }
        
        if (dangerousItems.length === 0) {
          return null; // Don't show strategy preview for safe champions
        }
        
        return dangerousItems
      }
    }
    return null; // Default for 'as' view
  }

  const getSafeChampionNotes = (champion: Champion, mode: ViewMode) => {
    if (mode === 'against') {
      // Get notes for safe champions (abilities that don't give CS but have notes)
      const noCSAbilities = champion.csMechanics.abilities.filter(ability => !ability.givesCS && ability.notes.trim() !== "")
      const passiveNoCS = !champion.csMechanics.passive.givesCS && champion.csMechanics.passive.notes.trim() !== ""
      
      let noteItems = []
      
      if (noCSAbilities.length > 0) {
        noteItems.push(...noCSAbilities.map(ability => ({
          type: 'ability',
          key: ability.key,
          name: ability.name,
          notes: ability.notes,
          image: getAbilityImageUrl(champion.id, ability.key)
        })))
      }
      
      if (passiveNoCS) {
        noteItems.push({
          type: 'passive',
          key: 'P',
          name: 'Passive',
          notes: champion.csMechanics.passive.notes,
          image: getPassiveImageUrl(champion.id)
        })
      }
      
      if (noteItems.length === 0) {
        return null
      }
      
      return noteItems
    }
    return null
  }

  const getDangerLabel = (dangerLevel: number): string => {
    return dangerLevel === 0 ? 'Safe' : 'Dangerous'
  }

  const getDangerColor = (dangerLevel: number): string => {
    return dangerLevel === 0 ? 'text-lol-green' : 'text-lol-red'
  }

  const getCardTint = (dangerLevel: number): string => {
    return dangerLevel === 0 ? 'border-lol-green/30 bg-lol-green/60' : 'border-lol-red/30 bg-lol-red/60'
  }

  const clearAllFilters = () => {
    setSelectedRoles([])
    setSelectedTypes([])
    setDangerFilter('all')
    setHasStrategy(null)
    setSearchTerm('')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-lol-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-lol-gold mx-auto mb-4"></div>
          <p className="text-lol-accent text-xl">Loading champions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-lol-dark">
      {/* Header */}
      <div className="bg-lol-darker border-b border-lol-gold/30 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-5xl font-bold text-lol-gold mb-4 text-shadow">
            CS Mechanics Database
          </h1>
          <p className="text-xl text-lol-accent/80">
            Learn which champion abilities and actions give CS when playing against them
          </p>
        </div>
      </div>

      {/* Filters and Sorting */}
      <div className="bg-lol-darker/50 py-6 border-b border-lol-gold/20">
        <div className="max-w-6xl mx-auto px-4">
          {/* Search Bar - Top Row */}
          <div className="flex justify-center mb-6">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lol-accent/60 w-5 h-5" />
              <input
                type="text"
                placeholder="Search champions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-lol-blue/80 border border-lol-gold/30 rounded-lg text-lol-accent placeholder-lol-accent/40 focus:outline-none focus:border-lol-gold/60"
              />
            </div>
          </div>

          {/* Filters - Second Row */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-lol-gold" />
              <span className="text-lol-accent font-medium">Filters:</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              {/* Role Filter */}
              <div className="flex flex-wrap gap-2">
                <span className="text-lol-accent/70 text-sm font-medium">Roles:</span>
                {availableRoles.map(role => (
                  <button
                    key={role}
                    onClick={() => {
                      setSelectedRoles(prev => 
                        prev.includes(role) 
                          ? prev.filter(r => r !== role)
                          : [...prev, role]
                      )
                    }}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                      selectedRoles.includes(role)
                        ? 'bg-lol-gold text-lol-dark'
                        : 'bg-lol-blue/80 text-lol-accent hover:bg-lol-blue/60'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>

              {/* Type Filter */}
              <div className="flex flex-wrap gap-2">
                <span className="text-lol-accent/70 text-sm font-medium">Types:</span>
                {availableTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => {
                      setSelectedTypes(prev => 
                        prev.includes(type) 
                          ? prev.filter(t => t !== type)
                          : [...prev, type]
                      )
                    }}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                      selectedTypes.includes(type)
                        ? 'bg-lol-gold text-lol-dark'
                        : 'bg-lol-blue/80 text-lol-accent hover:bg-lol-blue/60'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 mt-4">
              {/* Danger Filter */}
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-lol-gold" />
                <span className="text-lol-accent/70 text-sm font-medium">Danger:</span>
                <select
                  value={dangerFilter}
                  onChange={(e) => setDangerFilter(e.target.value)}
                  className="px-3 py-2 bg-lol-blue/80 border border-lol-gold/30 rounded text-lol-accent focus:outline-none focus:border-lol-gold/60"
                >
                  <option value="all">All Levels</option>
                  <option value="safe">Safe (0 CS)</option>
                  <option value="dangerous">Dangerous (1+ CS)</option>
                </select>
              </div>

              {/* Strategy Filter */}
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-lol-gold" />
                <span className="text-lol-accent/70 text-sm font-medium">Strategy:</span>
                <select
                  value={hasStrategy === null ? 'all' : hasStrategy ? 'has' : 'none'}
                  onChange={(e) => {
                    if (e.target.value === 'all') setHasStrategy(null)
                    else setHasStrategy(e.target.value === 'has')
                  }}
                  className="px-3 py-2 bg-lol-blue/80 border border-lol-gold/30 rounded text-lol-accent focus:outline-none focus:border-lol-gold/60"
                >
                  <option value="all">All</option>
                  <option value="has">Has Notes</option>
                  <option value="none">No Notes</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sorting and Actions - Third Row */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Sort Options */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <SortAsc className="w-4 h-4 text-lol-gold" />
                <span className="text-lol-accent/70 text-sm font-medium">Sort by:</span>
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as SortField)}
                  className="px-3 py-2 bg-lol-blue/80 border border-lol-gold/30 rounded text-lol-accent focus:outline-none focus:border-lol-gold/60"
                >
                  <option value="danger">Danger Level</option>
                  <option value="name">Name</option>
                  <option value="difficulty">Difficulty</option>
                  <option value="attack">Attack Rating</option>
                  <option value="defense">Defense Rating</option>
                  <option value="magic">Magic Rating</option>
                </select>
                
                <button
                  onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="p-2 bg-lol-blue/80 border border-lol-gold/30 rounded text-lol-accent hover:bg-lol-blue/60 transition-all"
                >
                  {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Clear Filters */}
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 bg-lol-red/20 text-lol-red border border-lol-red/30 rounded hover:bg-lol-red/30 transition-all"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      </div>

      {/* Champions Grid */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-lol-accent/60">
            Showing {filteredChampions.length} of {champions.length} champions
          </p>
          
          {/* Active Filters Summary */}
          {(selectedRoles.length > 0 || selectedTypes.length > 0 || dangerFilter !== 'all' || hasStrategy !== null) && (
            <div className="flex flex-wrap gap-2">
              <span className="text-lol-accent/60 text-sm">Active filters:</span>
              {selectedRoles.map(role => (
                <span key={role} className="px-2 py-1 bg-lol-gold/20 text-lol-gold text-xs rounded">
                  Role: {role}
                </span>
              ))}
              {selectedTypes.map(type => (
                <span key={type} className="px-2 py-1 bg-lol-gold/20 text-lol-gold text-xs rounded">
                  Type: {type}
                </span>
              ))}
              {dangerFilter !== 'all' && (
                <span className="px-2 py-1 bg-lol-gold/20 text-lol-gold text-xs rounded">
                  Danger: {dangerFilter === 'safe' ? 'Safe' : 'Dangerous'}
                </span>
              )}
              {hasStrategy !== null && (
                <span className="px-2 py-1 bg-lol-gold/20 text-lol-gold text-xs rounded">
                  Strategy: {hasStrategy ? 'Has Notes' : 'No Notes'}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Dangerous Champions Section */}
        {filteredChampions.filter(champion => getDangerLevel(champion, viewMode) > 0).length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-lol-red mb-6 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Dangerous Champions ({filteredChampions.filter(champion => getDangerLevel(champion, viewMode) > 0).length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredChampions
                .filter(champion => getDangerLevel(champion, viewMode) > 0)
                .map((champion) => {
                  const csStats = getCSStats(champion, viewMode)
                  const strategyPreview = getStrategyPreview(champion, viewMode)
                  const dangerLevel = getDangerLevel(champion, viewMode)
                  
                  return (
                    <Link key={champion.id} href={`/champions/${champion.id}`}>
                      <div className={`champion-card group cursor-pointer border-2 ${getCardTint(dangerLevel)} flex flex-col h-full`}>
                        <div className="relative mb-4">
                          <img
                            src={`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champion.id}_0.jpg`}
                            alt={champion.name}
                            className="w-full h-48 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                          />
                          
                          {/* Danger Level Badge */}
                          <div className={`absolute bottom-2 left-2 px-2 py-1 rounded text-xs font-medium bg-lol-dark/80 ${getDangerColor(dangerLevel)}`}>
                            {getDangerLabel(dangerLevel)}
                          </div>
                        </div>
                        
                        <h3 className="text-xl font-bold text-lol-gold mb-2 group-hover:text-glow transition-all">
                          {champion.name}
                        </h3>
                        <p className="text-lol-accent/70 text-sm mb-3 italic">
                          {champion.title}
                        </p>
                        
                        {/* Champion Tags */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          <span className="px-2 py-1 bg-lol-gold/80 text-lol-dark border border-lol-gold text-xs rounded font-semibold shadow-sm">
                            {getChampionRole(champion)}
                          </span>
                          {champion.tags.map(tag => (
                            <span key={tag} className="px-2 py-1 bg-lol-blue/80 text-white border border-lol-blue text-xs rounded font-semibold shadow-sm">
                              {tag}
                            </span>
                          ))}
                        </div>
                        
                        {/* CS Summary */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between">
                            <span className="text-lol-red font-medium text-sm flex items-center">
                              <AlertTriangle className="w-4 h-4 mr-1" />
                              Dangerous
                            </span>
                            <span className="text-lol-red font-bold">{csStats.givesCS}</span>
                          </div>
                        </div>
                        
                        {/* Strategy Preview */}
                        <div className="mt-auto">
                          {strategyPreview ? (
                            <div className="bg-lol-dark/50 rounded p-3 border-l border-lol-gold/30">
                              <p className="text-xs text-lol-red font-medium mb-2">Watch out for:</p>
                              <div className="space-y-2">
                                {strategyPreview.map((item, index) => (
                                  <div key={index} className="flex items-start gap-2">
                                    <img 
                                      src={item.image} 
                                      alt={`${item.key} - ${item.name}`}
                                      className="w-6 h-6 rounded"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none'
                                      }}
                                    />
                                    <div className="flex-1">
                                      <span className="text-xs font-medium text-lol-gold">
                                        {item.key} - {item.name}
                                      </span>
                                      {item.notes && (
                                        <p className="text-xs text-lol-accent/80 mt-1">
                                          {item.notes}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="bg-lol-dark/30 rounded p-3 border border-lol-gold/20">
                              <p className="text-xs text-lol-accent/60 text-center">No special strategy notes</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  )
                })}
            </div>
          </div>
        )}

        {/* Safe Champions Section */}
        {filteredChampions.filter(champion => getDangerLevel(champion, viewMode) === 0).length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-lol-green mb-6 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              Safe Champions ({filteredChampions.filter(champion => getDangerLevel(champion, viewMode) === 0).length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredChampions
                .filter(champion => getDangerLevel(champion, viewMode) === 0)
                .sort((a, b) => {
                  // Sort champions with notes first
                  const aHasNotes = getSafeChampionNotes(a, viewMode) !== null;
                  const bHasNotes = getSafeChampionNotes(b, viewMode) !== null;
                  
                  if (aHasNotes && !bHasNotes) return -1;
                  if (!aHasNotes && bHasNotes) return 1;
                  return 0;
                })
                .map((champion) => {
                  const dangerLevel = getDangerLevel(champion, viewMode)
                  
                  return (
                    <Link key={champion.id} href={`/champions/${champion.id}`}>
                      <div className={`champion-card group cursor-pointer border-2 ${getCardTint(dangerLevel)} flex flex-col h-full`}>
                        <div className="relative mb-4">
                          <img
                            src={`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champion.id}_0.jpg`}
                            alt={champion.name}
                            className="w-full h-48 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                          />
                          
                          {/* Danger Level Badge */}
                          <div className={`absolute bottom-2 left-2 px-2 py-1 rounded text-xs font-medium bg-lol-dark/80 ${getDangerColor(dangerLevel)}`}>
                            {getDangerLabel(dangerLevel)}
                          </div>
                        </div>
                        
                        <h3 className="text-xl font-bold text-lol-gold mb-2 group-hover:text-glow transition-all">
                          {champion.name}
                        </h3>
                        <p className="text-lol-accent/70 text-sm mb-3 italic">
                          {champion.title}
                        </p>
                        
                        {/* Champion Tags */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          <span className="px-2 py-1 bg-lol-gold/80 text-lol-dark border border-lol-gold text-xs rounded font-semibold shadow-sm">
                            {getChampionRole(champion)}
                          </span>
                          {champion.tags.map(tag => (
                            <span key={tag} className="px-2 py-1 bg-lol-blue/80 text-white border border-lol-blue text-xs rounded font-semibold shadow-sm">
                              {tag}
                            </span>
                          ))}
                        </div>
                        
                        {/* Strategy Preview for Safe Champions */}
                        <div className="mt-auto">
                          {getSafeChampionNotes(champion, viewMode) ? (
                            <div className="bg-lol-dark/50 rounded p-3 border-l border-lol-gold/30">
                              <p className="text-xs text-lol-green font-medium mb-2">Notes:</p>
                              <div className="space-y-2">
                                {getSafeChampionNotes(champion, viewMode)?.map((item, index) => (
                                  <div key={index} className="flex items-start gap-2">
                                    <img 
                                      src={item.image} 
                                      alt={`${item.key} - ${item.name}`}
                                      className="w-6 h-6 rounded"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none'
                                      }}
                                    />
                                    <div className="flex-1">
                                      <span className="text-xs font-medium text-lol-gold">
                                        {item.key} - {item.name}
                                      </span>
                                      {item.notes && (
                                        <p className="text-xs text-lol-accent/80 mt-1">
                                          {item.notes}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="bg-lol-dark/30 rounded p-3 border border-lol-gold/20">
                              <p className="text-xs text-lol-accent/60 text-center">No special notes</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  )
                })}
            </div>
          </div>
        )}

        {filteredChampions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lol-accent/60 text-lg">No champions found matching your criteria.</p>
            <p className="text-lol-accent/40 text-sm mt-2">Try adjusting your filters or search terms.</p>
          </div>
        )}
      </div>
    </div>
  )
}
