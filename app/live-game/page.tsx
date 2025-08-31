'use client'

import { useState, useEffect } from 'react'
import { getAbilityImageUrl, getPassiveImageUrl } from '../champion-image-filenames'
import { Heart, Sword, Target, Zap, Shield, Eye, Filter, SortAsc, SortDesc, User } from 'lucide-react'
import { getSummonerSpellImageUrl, getSummonerSpellName } from '../summoner-spells'

interface SummonerData {
  id: string
  puuid: string
  name: string
  riotId: string
  region: string
  summonerLevel: number
  profileIconId: number
}

interface LiveGameData {
  gameId: number
  gameMode: string
  gameType: string
  participants: Participant[]
  gameLength: number
}

interface Participant {
  summonerName: string
  championId: number
  championName: string
  teamId: number
  rank: string
  level: number
  profileIconId: number
}

interface ChampionAnalysis {
  name: string
  isDangerous: boolean
  notes: string
  dangerousAbilities: string[]
  abilityDetails?: {
    key: string
    name: string
    notes: string
  }[]
  basicAttacksDangerous: boolean
}

interface MatchData {
  // Basic match info
  matchId: string
  timestamp: string
  gameCreation: number
  gameDuration: number
  gameEndTimestamp?: number
  gameMode: string
  gameType: string
  queueId: number
  mapId: number
  gameVersion: string
  platformId: string
  
  // Champion info
  championName: string
  championId: number
  championTransform?: number
  champLevel: number
  champExperience: number
  
  // Basic stats
  cs: number
  totalMinionsKilled: number
  neutralMinionsKilled: number
  win: boolean
  
  // Combat stats
  kills: number
  deaths: number
  assists: number
  doubleKills: number
  tripleKills: number
  quadraKills: number
  pentaKills: number
  killingSprees: number
  largestKillingSpree: number
  largestMultiKill: number
  largestCriticalStrike: number
  
  // Damage stats
  totalDamageDealt: number
  totalDamageDealtToChampions: number
  physicalDamageDealt: number
  physicalDamageDealtToChampions: number
  magicDamageDealt: number
  magicDamageDealtToChampions: number
  trueDamageDealt: number
  trueDamageDealtToChampions: number
  totalDamageTaken: number
  physicalDamageTaken: number
  magicDamageTaken: number
  trueDamageTaken: number
  damageSelfMitigated: number
  
  // Gold and economy
  goldEarned: number
  goldSpent: number
  itemsPurchased: number
  consumablesPurchased: number
  
  // Vision and objectives
  visionScore: number
  wardsPlaced: number
  wardsKilled: number
  visionWardsBoughtInGame: number
  sightWardsBoughtInGame: number
  detectorWardsPlaced: number
  
  // Objectives
  dragonKills: number
  baronKills: number
  towerKills: number
  inhibitorKills: number
  nexusKills: number
  objectivesStolen: number
  objectivesStolenAssists: number
  
  // Team info
  teamId: number
  teamPosition: string
  individualPosition: string
  role: string
  lane: string
  
  // Summoner info
  summonerName: string
  summonerId: string
  summonerLevel: number
  profileIcon: number
  riotIdGameName: string
  riotIdTagline: string
  
  // Summoner spells
  summoner1Id: number
  summoner2Id: number
  summoner1Casts: number
  summoner2Casts: number
  spell1Casts: number
  spell2Casts: number
  spell3Casts: number
  spell4Casts: number
  
  // Items (all 7 slots)
  items: number[]
  
  // Perks and runes
  perks: any
  
  // Challenges (advanced stats)
  challenges: any
  
  // Time and positioning
  timePlayed: number
  timeCCingOthers: number
  totalTimeCCDealt: number
  totalTimeSpentDead: number
  longestTimeSpentLiving: number
  
  // Jungle and lane stats
  totalAllyJungleMinionsKilled: number
  totalEnemyJungleMinionsKilled: number
  
  // Healing and shielding
  totalHeal: number
  totalHealsOnTeammates: number
  totalDamageShieldedOnTeammates: number
  totalUnitsHealed: number
  
  // First blood/tower
  firstBloodKill: boolean
  firstBloodAssist: boolean
  firstTowerKill: boolean
  firstTowerAssist: boolean
  
  // Pings and communication
  allInPings: number
  assistMePings: number
  commandPings: number
  enemyMissingPings: number
  enemyVisionPings: number
  getBackPings: number
  holdPings: number
  needVisionPings: number
  onMyWayPings: number
  pushPings: number
  visionClearedPings: number
  
  // Game state
  bountyLevel: number
  eligibleForProgression: boolean
  gameEndedInEarlySurrender: boolean
  gameEndedInSurrender: boolean
  teamEarlySurrendered: boolean
  
  // Placement (for TFT/Arena)
  placement?: number
  playerAugment1?: number
  playerAugment2?: number
  playerAugment3?: number
  playerAugment4?: number
  playerSubteamId?: number
  subteamPlacement?: number
  
  // Player scores (for various game modes)
  playerScore0: number
  playerScore1: number
  playerScore2: number
  playerScore3: number
  playerScore4: number
  playerScore5: number
  playerScore6: number
  playerScore7: number
  playerScore8: number
  playerScore9: number
  playerScore10: number
  playerScore11: number
  
  // Missions (for special game modes)
  missions: any
}

export default function LiveGamePage() {
  const [searchInput, setSearchInput] = useState('')
  const [summonerData, setSummonerData] = useState<SummonerData | null>(null)
  const [liveGame, setLiveGame] = useState<LiveGameData | null>(null)
  const [championAnalysis, setChampionAnalysis] = useState<ChampionAnalysis[]>([])
  const [matchHistory, setMatchHistory] = useState<MatchData[]>([])
  const [matchHistoryLoading, setMatchHistoryLoading] = useState(false)
  const [expandedMatches, setExpandedMatches] = useState<Set<number>>(new Set())
  const [summonerSpells, setSummonerSpells] = useState<Record<number, { imageUrl: string; name: string }>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')


  const handleSearch = async () => {
    if (!searchInput.trim()) {
      setError('Please enter a summoner name')
      return
    }

    setLoading(true)
    setError('')
         setSummonerData(null)
     setLiveGame(null)
     setChampionAnalysis([])
     setMatchHistory([])

    try {
      // Search for summoner using the full input (backend will split by #)
      const summonerResponse = await fetch(`/api/riot/summoner?name=${encodeURIComponent(searchInput)}`)
      
      if (!summonerResponse.ok) {
        const errorData = await summonerResponse.json()
        throw new Error(errorData.error || 'Failed to find summoner')
      }

      const summoner = await summonerResponse.json()
      console.log('Summoner data received:', summoner)
      setSummonerData(summoner)

      // Check for live game
      try {
        const liveGameResponse = await fetch(`/api/riot/live-game?puuid=${summoner.puuid}&region=${summoner.region}`)
        if (liveGameResponse.ok) {
          const gameData = await liveGameResponse.json()
          setLiveGame(gameData)
          
          // Get champion analysis for the live game
          const championNames = gameData.participants.map((p: any) => p.championName)
          console.log('Getting analysis for champions:', championNames)
          const analysis = await getChampionAnalysis(championNames)
          console.log('Analysis result:', analysis)
          setChampionAnalysis(analysis)
        }
      } catch (error) {
        // No live game found, this is normal
        console.log('No live game found')
        setChampionAnalysis([])
      }

    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getChampionAnalysis = async (championNames: string[]): Promise<ChampionAnalysis[]> => {
    try {
      const response = await fetch(`/api/riot/champion-analysis?champions=${championNames.join(',')}`)
      if (response.ok) {
        const data = await response.json()
        return data.analysis
      } else {
        console.error('Champion analysis API returned error:', response.status)
      }
    } catch (error) {
      console.error('Failed to get champion analysis:', error)
    }
    
         // Fallback analysis
     return championNames.map(name => ({
       name,
       isDangerous: false,
       dangerousAbilities: [],
       abilityDetails: [],
       notes: 'Analysis unavailable. Use caution with abilities near minions.',
       basicAttacksDangerous: true
     }))
  }

  const formatGameDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getProfileIconUrl = (profileIconId: number) => {
    return `https://ddragon.leagueoflegends.com/cdn/15.17.1/img/profileicon/${profileIconId}.png`
  }

  const getChampionImageUrl = (championName: string) => {
    // Convert champion name to URL-friendly format
    const formattedName = championName
      .replace(/['\s]/g, '') // Remove apostrophes and spaces
      .replace(/\./g, '') // Remove dots
      .replace(/&/g, '') // Remove ampersands
      .replace(/[^\w]/g, '') // Remove any other special characters
    
    return `https://ddragon.leagueoflegends.com/cdn/15.17.1/img/champion/${formattedName}.png`
  }

  const fetchMatchHistory = async () => {
    if (!summonerData?.puuid || !summonerData?.region) return
    
    setMatchHistoryLoading(true)
    try {
      const response = await fetch(`/api/riot/match-history?puuid=${summonerData.puuid}&region=${summonerData.region}`)
      if (response.ok) {
        const data = await response.json()
        setMatchHistory(data.matches || [])
        
        // Load summoner spell data for all matches
        await loadSummonerSpells(data.matches || [])
      }
    } catch (error) {
      console.error('Failed to fetch match history:', error)
    } finally {
      setMatchHistoryLoading(false)
    }
  }

  // Load summoner spell data for matches
  const loadSummonerSpells = async (matches: MatchData[]) => {
    const spellsData: Record<number, { imageUrl: string; name: string }> = {}
    
    for (const match of matches) {
      try {
        // Load spell 1
        if (match.summoner1Id) {
          const imageUrl = await getSummonerSpellImageUrl(match.summoner1Id)
          const name = await getSummonerSpellName(match.summoner1Id)
          if (imageUrl && name) {
            spellsData[match.summoner1Id] = { imageUrl, name }
          }
        }
        
        // Load spell 2
        if (match.summoner2Id) {
          const imageUrl = await getSummonerSpellImageUrl(match.summoner2Id)
          const name = await getSummonerSpellName(match.summoner2Id)
          if (imageUrl && name) {
            spellsData[match.summoner2Id] = { imageUrl, name }
          }
        }
      } catch (error) {
        console.error('Failed to load summoner spell data:', error)
      }
    }
    
    setSummonerSpells(spellsData)
  }

  // Fetch match history when summoner data changes
  useEffect(() => {
    if (summonerData?.puuid && summonerData?.region) {
      fetchMatchHistory()
    }
  }, [summonerData])

  const toggleMatchExpansion = (index: number) => {
    const newExpanded = new Set(expandedMatches)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedMatches(newExpanded)
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-500/20 text-yellow-100 border border-yellow-400/40 mb-4">
            🚧 Work in Progress
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            Live Game Analysis
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Analyze enemy champions and their CS mechanics in real-time during your League of Legends matches
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-white/10 shadow-2xl">
          
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2 text-slate-200">Riot ID</label>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Enter Riot ID (e.g., MeatKebab#HALAL)"
                className="w-full px-6 py-4 bg-slate-800/50 border border-slate-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white placeholder-slate-400 transition-all duration-200"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-700 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 disabled:transform-none shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Searching...
                  </div>
                ) : (
                  'Search'
                )}
              </button>
            </div>
          </div>
          
          {error && (
            <div className="text-red-300 text-sm bg-red-500/20 border border-red-500/30 rounded-lg p-3">{error}</div>
          )}
        </div>

                 {summonerData && (
           <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 shadow-2xl">
             {/* Summoner Info */}
             <div className="flex items-center gap-6 mb-8">
               <div className="relative">
                 <img
                   src={getProfileIconUrl(summonerData.profileIconId)}
                   alt="Profile Icon"
                   className="w-20 h-20 rounded-full border-4 border-blue-500/50 shadow-lg"
                 />
                 <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                   {summonerData.summonerLevel}
                 </div>
               </div>
               <div>
                 <h2 className="text-3xl font-bold text-white mb-2">
                   {summonerData.riotId}
                 </h2>
                 <div className="flex items-center gap-4 text-slate-300">
                   <div className="flex items-center gap-2">
                     <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                       <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                     </svg>
                     {summonerData.region.toUpperCase()}
                   </div>
                   <div className="flex items-center gap-2">
                     <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                       <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                     </svg>
                     Level {summonerData.summonerLevel}
                   </div>
                 </div>
               </div>
             </div>

             {/* Live Game Analysis */}
             <div>
               {liveGame ? (
                 <div>
                  

                  {/* Enemy Team */}
                  <div>
                    <h4 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                      <svg className="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Enemy Team
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {liveGame.participants
                        .filter((p: any) => {
                          // Find the summoner's team ID by matching summoner name
                          if (!summonerData?.riotId) return false
                          
                          const summonerTeamId = liveGame.participants.find((p2: any) => {
                            const gameName = summonerData.riotId.split('#')[0]
                            const matches = p2.summonerName.includes(gameName)
                            console.log('Team matching:', {
                              participantName: p2.summonerName,
                              gameName,
                              matches,
                              teamId: p2.teamId
                            })
                            return matches
                          })?.teamId
                          
                          // Show only participants NOT on the summoner's team (enemies)
                          return summonerTeamId && p.teamId !== summonerTeamId
                        })
                        .map((participant: any, index) => {
                                                     const analysis = championAnalysis.find(a => a.name === participant.championName) || {
                             name: participant.championName,
                             isDangerous: false,
                             notes: 'Analysis unavailable',
                             dangerousAbilities: [],
                             abilityDetails: [],
                             basicAttacksDangerous: true
                           }
                          return analysis
                        })
                        .sort((a, b) => {
                          // Sort dangerous champions first
                          if (a.isDangerous && !b.isDangerous) return -1
                          if (!a.isDangerous && b.isDangerous) return 1
                          return 0
                        })
                        .map((analysis, index) => {
                                                     const isDangerous = analysis.isDangerous && ((analysis.abilityDetails && analysis.abilityDetails.length > 0) || analysis.dangerousAbilities.length > 0)
                          return (
                            <div 
                              key={index} 
                              className={`backdrop-blur-sm rounded-xl border transition-all duration-200 hover:transform hover:scale-105 p-6 ${
                                isDangerous 
                                  ? 'bg-gradient-to-br from-red-500/10 to-red-600/10 border-red-500/30 hover:border-red-500/50' 
                                  : 'bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/30 hover:border-green-500/50'
                              }`}
                            >
                              {/* Champion Profile Header */}
                              <div className="flex flex-col items-center text-center mb-4">
                                <div className="relative mb-3">
                                  <img
                                    src={getChampionImageUrl(analysis.name)}
                                    alt={`${analysis.name} portrait`}
                                    className={`w-16 h-16 rounded-full border-2 shadow-lg ${
                                      isDangerous ? 'border-red-500/50' : 'border-green-500/50'
                                    }`}
                                    onError={(e) => {
                                      // Fallback to a default image if champion image fails to load
                                      e.currentTarget.src = 'https://ddragon.leagueoflegends.com/cdn/15.17.1/img/champion/Ahri.png'
                                    }}
                                  />
                                </div>
                                <div className="font-bold text-lg text-white mb-1">{analysis.name}</div>
                                <div className="text-sm text-slate-300">
                                  {liveGame.participants.find(p => p.championName === analysis.name)?.summonerName || 'Unknown'}
                                </div>
                              </div>
                              
                              {/* Champion Analysis Content */}
                              <div className="space-y-3">
                                {isDangerous ? (
                                  <div className="text-center">
                                    <div className="text-sm text-red-300 font-medium mb-2">
                                      ⚠️ Dangerous Champion
                                    </div>
                                                                         <div className="text-sm text-red-400 font-medium mb-2">
                                       Watch out for:
                                     </div>
                                     <div className="space-y-2">
                                       {analysis.abilityDetails?.map((ability, idx) => (
                                         <div key={idx} className="flex items-center gap-2 p-2 bg-red-500/20 rounded-lg border border-red-500/30">
                                           <img 
                                             src={getAbilityImageUrl(analysis.name, ability.key)} 
                                             alt={`${ability.key} - ${ability.name}`}
                                             className="w-6 h-6 rounded"
                                             onError={(e) => {
                                               e.currentTarget.style.display = 'none'
                                             }}
                                           />
                                           <div className="flex-1">
                                             <span className="text-xs font-medium text-red-300">
                                               {ability.key} - {ability.name}
                                             </span>
                                             {ability.notes && (
                                               <p className="text-xs text-red-200/80 mt-1">
                                                 {ability.notes}
                                               </p>
                                             )}
                                           </div>
                                         </div>
                                       )) || analysis.dangerousAbilities.map((abilityKey, idx) => (
                                         <div key={idx} className="flex items-center gap-2 p-2 bg-red-500/20 rounded-lg border border-red-500/30">
                                           <img 
                                             src={getAbilityImageUrl(analysis.name, abilityKey)} 
                                             alt={`${abilityKey}`}
                                             className="w-6 h-6 rounded"
                                             onError={(e) => {
                                               e.currentTarget.style.display = 'none'
                                             }}
                                           />
                                           <div className="flex-1">
                                             <span className="text-xs font-medium text-red-300">
                                               {abilityKey}
                                             </span>
                                           </div>
                                         </div>
                                       ))}
                                     </div>
                                    {analysis.notes && (
                                      <div className="text-sm text-amber-200 bg-amber-500/20 rounded-lg p-3 border border-amber-500/30">
                                        {analysis.notes}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="text-center">
                                    <div className="text-sm text-green-300 font-medium mb-2">
                                      ✅ Safe Champion
                                    </div>
                                    <div className="text-sm text-green-200">
                                      This champion appears to be safe.
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                    </div>
                                     </div>

                                     </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-slate-400 mb-3 text-lg">No active game found</div>
                    <div className="text-slate-500">
                      This summoner is not currently in a game
                    </div>
                  </div>
                )}

                {/* Previous Matches Section */}
        {matchHistory.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              Previous Low CS Matches
            </h2>
            <div className="space-y-4">
              {matchHistory.map((match, index) => {
                const isZeroCS = match.cs === 0
                const cardBackground = isZeroCS 
                  ? 'bg-gradient-to-br from-amber-800/30 via-yellow-700/20 to-amber-900/40' 
                  : 'bg-gradient-to-br from-slate-700/50 to-slate-800/50'
                const cardBorder = isZeroCS 
                  ? 'border-amber-400/60' 
                  : match.win 
                    ? 'border-green-500/30' 
                    : 'border-red-500/30'
                const textColor = isZeroCS ? 'text-white' : 'text-slate-400'
                const isExpanded = expandedMatches.has(index)

                return (
                  <div
                    key={match.matchId}
                    className={`relative overflow-hidden rounded-xl border-2 ${cardBackground} ${cardBorder} backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] cursor-pointer`}
                    onClick={() => toggleMatchExpansion(index)}
                  >
                    {/* Champion Splash Art Background */}
                    <div className="absolute inset-0 opacity-10">
                      <img
                        src={`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${match.championName}_0.jpg`}
                        alt={`${match.championName} splash art`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                      <div className="absolute inset-0 bg-black/60" />
                    </div>

                    {/* Content Overlay */}
                    <div className="relative z-10 p-6">
                      {/* Card Header - Compact View */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <img
                            src={`https://ddragon.leagueoflegends.com/cdn/15.17.1/img/champion/${match.championName}.png`}
                            alt={match.championName}
                            className="w-16 h-16 rounded-lg border-2 border-white/20"
                          />
                          <div>
                            <h3 className={`text-xl font-bold ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                              {match.championName}
                            </h3>
                            <p className={`text-sm ${isZeroCS ? 'text-amber-200' : textColor}`}>
                              {match.teamPosition} • {match.cs} CS
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            match.win 
                              ? 'bg-green-500/20 text-green-100 border border-green-400/40' 
                              : 'bg-red-500/20 text-red-100 border border-red-400/40'
                          }`}>
                            {match.win ? 'Victory' : 'Defeat'}
                          </div>
                          <p className={`text-sm mt-1 ${isZeroCS ? 'text-amber-200' : textColor}`}>
                            {match.gameMode === 'CHERRY' ? 'Arena' : match.gameMode === 'CLASSIC' ? 'Solo/Duo' : match.gameMode}
                          </p>
                        </div>
                      </div>

                      {/* Key Stats Grid - Always Visible */}
                      <div className="grid grid-cols-4 gap-4 mb-4 p-4 bg-black/20 rounded-lg">
                        <div className="text-center">
                          <p className={`text-xs ${isZeroCS ? 'text-amber-300' : 'text-slate-400'}`}>Duration</p>
                          <p className={`font-semibold ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                            {formatGameDuration(match.gameDuration)}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className={`text-xs ${isZeroCS ? 'text-amber-300' : 'text-slate-400'}`}>KDA</p>
                          <p className={`font-semibold ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                            {match.kills}/{match.deaths}/{match.assists}
                          </p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center space-x-1 mb-1">
                            <img
                              src="/images/live/Gold.png"
                              alt="Gold"
                              className="w-4 h-4"
                            />
                            <span className={`text-xs ${isZeroCS ? 'text-amber-300' : 'text-slate-400'}`}>Gold</span>
                          </div>
                          <p className={`font-semibold ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                            {formatNumber(match.goldEarned)}
                          </p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center space-x-1 mb-1">
                            <img
                              src="/images/live/Experience.png"
                              alt="Experience"
                              className="w-4 h-4"
                            />
                            <span className={`text-xs ${isZeroCS ? 'text-amber-300' : 'text-slate-400'}`}>Level</span>
                          </div>
                          <p className={`font-semibold ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                            {match.champLevel}
                          </p>
                        </div>
                      </div>

                      {/* Expandable Details */}
                      <div className="border-t border-white/10 pt-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleMatchExpansion(index)
                          }}
                          className={`w-full text-center py-2 px-4 rounded-lg transition-colors ${
                            isZeroCS 
                              ? 'bg-amber-500/20 text-amber-100 hover:bg-amber-500/30' 
                              : 'bg-slate-600/50 text-slate-300 hover:bg-slate-600/70'
                          }`}
                        >
                          {isExpanded ? 'Show Less' : 'Show More Details'}
                        </button>

                        {isExpanded && (
                          <div className="mt-4 space-y-6">
                            {/* Combat & Performance */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* Damage Stats */}
                              <div className="bg-black/20 rounded-lg p-4">
                                <h4 className={`text-lg font-semibold mb-3 ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                                  Combat Performance
                                </h4>
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-2">
                                      <Sword className="w-4 h-4 text-red-500" />
                                      <span className={textColor}>Total Damage:</span>
                                    </div>
                                    <span className={`font-medium ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                                      {formatNumber(match.totalDamageDealtToChampions)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-2">
                                      <Target className="w-4 h-4 text-orange-500" />
                                      <span className={textColor}>Physical Damage:</span>
                                    </div>
                                    <span className={`font-medium ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                                      {formatNumber(match.physicalDamageDealtToChampions)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-2">
                                      <Zap className="w-4 h-4 text-blue-500" />
                                      <span className={textColor}>Magic Damage:</span>
                                    </div>
                                    <span className={`font-medium ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                                      {formatNumber(match.magicDamageDealtToChampions)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-2">
                                      <Target className="w-4 h-4 text-purple-500" />
                                      <span className={textColor}>True Damage:</span>
                                    </div>
                                    <span className={`font-medium ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                                      {formatNumber(match.trueDamageDealtToChampions)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-2">
                                      <Shield className="w-4 h-4 text-blue-500" />
                                      <span className={textColor}>Damage Taken:</span>
                                    </div>
                                    <span className={`font-medium ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                                      {formatNumber(match.totalDamageTaken)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-2">
                                      <Shield className="w-4 h-4 text-green-500" />
                                      <span className={textColor}>Damage Mitigated:</span>
                                    </div>
                                    <span className={`font-medium ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                                      {formatNumber(match.damageSelfMitigated)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-2">
                                      <Heart className="w-4 h-4 text-red-400" />
                                      <span className={textColor}>Healing Done:</span>
                                    </div>
                                    <span className={`font-medium ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                                      {formatNumber(match.totalHeal)}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Vision & Objectives */}
                              <div className="bg-black/20 rounded-lg p-4">
                                <h4 className={`text-lg font-semibold mb-3 ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                                  Vision & Objectives
                                </h4>
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-2">
                                      <Eye className="w-4 h-4 text-blue-500" />
                                      <span className={textColor}>Vision Score:</span>
                                    </div>
                                    <span className={`font-medium ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                                      {match.visionScore}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-2">
                                      <Eye className="w-4 h-4 text-green-500" />
                                      <span className={textColor}>Wards Placed:</span>
                                    </div>
                                    <span className={`font-medium ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                                      {match.wardsPlaced}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-2">
                                      <Eye className="w-4 h-4 text-red-500" />
                                      <span className={textColor}>Wards Killed:</span>
                                    </div>
                                    <span className={`font-medium ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                                      {match.wardsKilled}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-2">
                                      <Eye className="w-4 h-4 text-purple-500" />
                                      <span className={textColor}>Control Wards:</span>
                                    </div>
                                    <span className={`font-medium ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                                      {match.visionWardsBoughtInGame}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-2">
                                      <Target className="w-4 h-4 text-orange-500" />
                                      <span className={textColor}>Dragon Kills:</span>
                                    </div>
                                    <span className={`font-medium ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                                      {match.dragonKills}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-2">
                                      <Target className="w-4 h-4 text-purple-500" />
                                      <span className={textColor}>Baron Kills:</span>
                                    </div>
                                    <span className={`font-medium ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                                      {match.baronKills}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-2">
                                      <Target className="w-4 h-4 text-yellow-500" />
                                      <span className={textColor}>Tower Kills:</span>
                                    </div>
                                    <span className={`font-medium ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                                      {match.towerKills}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-2">
                                      <Target className="w-4 h-4 text-red-500" />
                                      <span className={textColor}>Inhibitor Kills:</span>
                                    </div>
                                    <span className={`font-medium ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                                      {match.inhibitorKills}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Kills & Multi-kills */}
                            <div className="bg-black/20 rounded-lg p-4">
                              <h4 className={`text-lg font-semibold mb-3 ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                                Kills & Multi-kills
                              </h4>
                              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="text-center">
                                  <p className={`text-xs ${textColor}`}>Killing Sprees</p>
                                  <p className={`font-semibold ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                                    {match.killingSprees}
                                  </p>
                                </div>
                                <div className="text-center">
                                  <p className={`text-xs ${textColor}`}>Largest Spree</p>
                                  <p className={`font-semibold ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                                    {match.largestKillingSpree}
                                  </p>
                                </div>
                                <div className="text-center">
                                  <p className={`text-xs ${textColor}`}>Double Kills</p>
                                  <p className={`font-semibold ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                                    {match.doubleKills}
                                  </p>
                                </div>
                                <div className="text-center">
                                  <p className={`text-xs ${textColor}`}>Triple Kills</p>
                                  <p className={`font-semibold ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                                    {match.tripleKills}
                                  </p>
                                </div>
                                <div className="text-center">
                                  <p className={`text-xs ${textColor}`}>Quadra Kills</p>
                                  <p className={`font-semibold ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                                    {match.quadraKills}
                                  </p>
                                </div>
                                <div className="text-center">
                                  <p className={`text-xs ${textColor}`}>Penta Kills</p>
                                  <p className={`font-semibold ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                                    {match.pentaKills}
                                  </p>
                                </div>
                                <div className="text-center">
                                  <p className={`text-xs ${textColor}`}>Largest Crit</p>
                                  <p className={`font-semibold ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                                    {formatNumber(match.largestCriticalStrike)}
                                  </p>
                                </div>
                                <div className="text-center">
                                  <p className={`text-xs ${textColor}`}>Objectives Stolen</p>
                                  <p className={`font-semibold ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                                    {match.objectivesStolen}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Items & Spells */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* Items Built */}
                              <div className="bg-black/20 rounded-lg p-4">
                                <h4 className={`text-lg font-semibold mb-3 ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                                  Items Built
                                </h4>
                                <div className="grid grid-cols-4 gap-2">
                                  {match.items.map((itemId, itemIndex) => (
                                    <div key={itemIndex} className="text-center">
                                      {itemId > 0 ? (
                                        <img
                                          src={`https://ddragon.leagueoflegends.com/cdn/15.17.1/img/item/${itemId}.png`}
                                          alt={`Item ${itemId}`}
                                          className="w-10 h-10 mx-auto rounded border border-white/20"
                                          onError={(e) => {
                                            e.currentTarget.style.display = 'none'
                                          }}
                                        />
                                      ) : (
                                        <div className="w-10 h-10 mx-auto bg-slate-600/30 rounded border border-white/10 flex items-center justify-center">
                                          <span className="text-xs text-slate-400">-</span>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                                <div className="mt-3 text-center">
                                  <p className={`text-xs ${textColor}`}>
                                    Items Purchased: {match.itemsPurchased} • Consumables: {match.consumablesPurchased}
                                  </p>
                                </div>
                              </div>

                              {/* Summoner Spells */}
                              <div className="bg-black/20 rounded-lg p-4">
                                <h4 className={`text-lg font-semibold mb-3 ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                                  Summoner Spells
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="text-center">
                                    {summonerSpells[match.summoner1Id] ? (
                                      <>
                                        <img
                                          src={summonerSpells[match.summoner1Id].imageUrl}
                                          alt={summonerSpells[match.summoner1Id].name}
                                          className="w-8 h-8 mx-auto rounded border border-white/20"
                                          onError={(e) => {
                                            e.currentTarget.style.display = 'none'
                                          }}
                                        />
                                        <p className={`text-xs mt-1 ${textColor}`}>
                                          {summonerSpells[match.summoner1Id].name}
                                        </p>
                                        <p className={`font-medium ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                                          {match.summoner1Casts || 0}
                                        </p>
                                      </>
                                    ) : (
                                      <div className="w-8 h-8 mx-auto rounded border border-white/20 bg-slate-700/50 flex items-center justify-center">
                                        <span className={`text-xs ${textColor}`}>Loading...</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-center">
                                    {summonerSpells[match.summoner2Id] ? (
                                      <>
                                        <img
                                          src={summonerSpells[match.summoner2Id].imageUrl}
                                          alt={summonerSpells[match.summoner2Id].name}
                                          className="w-8 h-8 mx-auto rounded border border-white/20"
                                          onError={(e) => {
                                            e.currentTarget.style.display = 'none'
                                          }}
                                        />
                                        <p className={`text-xs mt-1 ${textColor}`}>
                                          {summonerSpells[match.summoner2Id].name}
                                        </p>
                                        <p className={`font-medium ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                                          {match.summoner2Casts || 0}
                                        </p>
                                      </>
                                    ) : (
                                      <div className="w-8 h-8 mx-auto rounded border border-white/20 bg-slate-700/50 flex items-center justify-center">
                                        <span className={`text-xs ${textColor}`}>Loading...</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Champion Ability Casts */}
                                <div className="mt-4">
                                  <h5 className={`text-sm font-semibold mb-2 ${isZeroCS ? 'text-amber-200' : 'text-slate-300'}`}>
                                    Champion Abilities
                                  </h5>
                                  <div className="grid grid-cols-4 gap-2">
                                    <div className="text-center">
                                      <img
                                        src={getAbilityImageUrl(match.championName, 'Q')}
                                        alt="Q Ability"
                                        className="w-8 h-8 mx-auto rounded border border-white/20"
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none'
                                        }}
                                      />
                                      <p className={`text-xs mt-1 ${textColor}`}>Q</p>
                                      <p className={`font-medium ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                                        {match.spell1Casts}
                                      </p>
                                    </div>
                                    <div className="text-center">
                                      <img
                                        src={getAbilityImageUrl(match.championName, 'W')}
                                        alt="W Ability"
                                        className="w-8 h-8 mx-auto rounded border border-white/20"
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none'
                                        }}
                                      />
                                      <p className={`text-xs mt-1 ${textColor}`}>W</p>
                                      <p className={`font-medium ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                                        {match.spell2Casts}
                                      </p>
                                    </div>
                                    <div className="text-center">
                                      <img
                                        src={getAbilityImageUrl(match.championName, 'E')}
                                        alt="E Ability"
                                        className="w-8 h-8 mx-auto rounded border border-white/20"
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none'
                                        }}
                                      />
                                      <p className={`text-xs mt-1 ${textColor}`}>E</p>
                                      <p className={`font-medium ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                                        {match.spell3Casts}
                                      </p>
                                    </div>
                                    <div className="text-center">
                                      <img
                                        src={getAbilityImageUrl(match.championName, 'R')}
                                        alt="R Ability"
                                        className="w-8 h-8 mx-auto rounded border border-white/20"
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none'
                                        }}
                                      />
                                      <p className={`text-xs mt-1 ${textColor}`}>R</p>
                                      <p className={`font-medium ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                                        {match.spell4Casts}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* CS & Minions */}
                            <div className="bg-black/20 rounded-lg p-4">
                              <h4 className={`text-lg font-semibold mb-3 ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                                CS & Minions
                              </h4>
                                                              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                  <div className="text-center">
                                    <div className="flex items-center justify-center space-x-1 mb-1">
                                      <Target className="w-4 h-4 text-yellow-500" />
                                      <p className={`text-xs ${textColor}`}>Total CS</p>
                                    </div>
                                    <p className={`font-semibold ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                                      {match.cs}
                                    </p>
                                  </div>
                                  <div className="text-center">
                                    <div className="flex items-center justify-center space-x-1 mb-1">
                                      <Target className="w-4 h-4 text-green-500" />
                                      <p className={`text-xs ${textColor}`}>Minions Killed</p>
                                    </div>
                                    <p className={`font-semibold ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                                      {match.totalMinionsKilled}
                                    </p>
                                  </div>
                                  <div className="text-center">
                                    <div className="flex items-center justify-center space-x-1 mb-1">
                                      <Target className="w-4 h-4 text-orange-500" />
                                      <p className={`text-xs ${textColor}`}>Jungle CS</p>
                                    </div>
                                    <p className={`font-semibold ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                                      {match.neutralMinionsKilled}
                                    </p>
                                  </div>
                                  <div className="text-center">
                                    <div className="flex items-center justify-center space-x-1 mb-1">
                                      <Target className="w-4 h-4 text-red-500" />
                                      <p className={`text-xs ${textColor}`}>Enemy Jungle</p>
                                    </div>
                                    <p className={`font-semibold ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                                      {match.totalEnemyJungleMinionsKilled}
                                    </p>
                                  </div>
                                </div>
                            </div>

                            {/* Game Details & Achievements */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* Game Info */}
                              <div className="bg-black/20 rounded-lg p-4">
                                <h4 className={`text-lg font-semibold mb-3 ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                                  Game Information
                                </h4>
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-2">
                                      <img
                                        src="/images/live/Experience.png"
                                        alt="Experience"
                                        className="w-4 h-4"
                                      />
                                      <span className={textColor}>Champion Level:</span>
                                    </div>
                                    <span className={`font-medium ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                                      {match.champLevel}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-2">
                                      <Target className="w-4 h-4 text-blue-500" />
                                      <span className={textColor}>Queue ID:</span>
                                    </div>
                                    <span className={`font-medium ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                                      {match.queueId}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-2">
                                      <Target className="w-4 h-4 text-green-500" />
                                      <span className={textColor}>Game Version:</span>
                                    </div>
                                    <span className={`font-medium ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                                      {match.gameVersion}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Achievements & Firsts */}
                              <div className="bg-black/20 rounded-lg p-4">
                                <h4 className={`text-lg font-semibold mb-3 ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                                  Achievements
                                </h4>
                                <div className="space-y-3">
                                  {/* First Blood */}
                                  {(match.firstBloodKill || match.firstBloodAssist) && (
                                    <div className="flex items-center space-x-2">
                                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                      <span className={`text-sm font-medium ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                                        {match.firstBloodKill ? 'First Blood' : 'First Blood Assist'}
                                      </span>
                                    </div>
                                  )}
                                  
                                  {/* First Tower */}
                                  {(match.firstTowerKill || match.firstTowerAssist) && (
                                    <div className="flex items-center space-x-2">
                                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                      <span className={`text-sm font-medium ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                                        {match.firstTowerKill ? 'First Tower' : 'First Tower Assist'}
                                      </span>
                                    </div>
                                  )}
                                  
                                  {/* Bounty Level */}
                                  {match.bountyLevel > 0 && (
                                    <div className="flex items-center space-x-2">
                                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                      <span className={`text-sm font-medium ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                                        Bounty Level {match.bountyLevel}
                                      </span>
                                    </div>
                                  )}
                                  
                                  {/* Killing Spree */}
                                  {match.largestKillingSpree >= 3 && (
                                    <div className="flex items-center space-x-2">
                                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                      <span className={`text-sm font-medium ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                                        {match.largestKillingSpree} Kill Spree
                                      </span>
                                    </div>
                                  )}
                                  
                                  {/* Multi-kills */}
                                  {match.doubleKills > 0 && (
                                    <div className="flex items-center space-x-2">
                                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                      <span className={`text-sm font-medium ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                                        {match.doubleKills} Double Kill{match.doubleKills > 1 ? 's' : ''}
                                      </span>
                                    </div>
                                  )}
                                  
                                  {match.tripleKills > 0 && (
                                    <div className="flex items-center space-x-2">
                                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                      <span className={`text-sm font-medium ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                                        {match.tripleKills} Triple Kill{match.tripleKills > 1 ? 's' : ''}
                                      </span>
                                    </div>
                                  )}
                                  
                                  {match.quadraKills > 0 && (
                                    <div className="flex items-center space-x-2">
                                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                      <span className={`text-sm font-medium ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                                        {match.quadraKills} Quadra Kill{match.quadraKills > 1 ? 's' : ''}
                                      </span>
                                    </div>
                                  )}
                                  
                                  {match.pentaKills > 0 && (
                                    <div className="flex items-center space-x-2">
                                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                      <span className={`text-sm font-medium ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                                        {match.pentaKills} Penta Kill{match.pentaKills > 1 ? 's' : ''}
                                      </span>
                                    </div>
                                  )}
                                  
                                  {/* No achievements */}
                                  {!match.firstBloodKill && !match.firstBloodAssist && !match.firstTowerKill && 
                                   !match.firstTowerAssist && match.bountyLevel === 0 && match.largestKillingSpree < 3 &&
                                   match.doubleKills === 0 && match.tripleKills === 0 && match.quadraKills === 0 && match.pentaKills === 0 && (
                                    <div className="text-center py-2">
                                      <span className={`text-sm ${textColor}`}>No special achievements</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Time Stats */}
                            <div className="bg-black/20 rounded-lg p-4">
                              <h4 className={`text-lg font-semibold mb-3 ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                                Time Statistics
                              </h4>
                                                              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                                  <div className="text-center">
                                    <div className="flex items-center justify-center space-x-1 mb-1">
                                      <Target className="w-4 h-4 text-green-500" />
                                      <p className={`text-xs ${textColor}`}>Time Played</p>
                                    </div>
                                    <p className={`font-medium ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                                      {formatGameDuration(match.timePlayed)}
                                    </p>
                                  </div>
                                  <div className="text-center">
                                    <div className="flex items-center justify-center space-x-1 mb-1">
                                      <Zap className="w-4 h-4 text-blue-500" />
                                      <p className={`text-xs ${textColor}`}>Time CCing</p>
                                    </div>
                                    <p className={`font-medium ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                                      {formatGameDuration(match.timeCCingOthers)}
                                    </p>
                                  </div>
                                  <div className="text-center">
                                    <div className="flex items-center justify-center space-x-1 mb-1">
                                      <Target className="w-4 h-4 text-purple-500" />
                                      <p className={`text-xs ${textColor}`}>Total CC Dealt</p>
                                    </div>
                                    <p className={`font-medium ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                                      {formatGameDuration(match.totalTimeCCDealt)}
                                    </p>
                                  </div>
                                  <div className="text-center">
                                    <div className="flex items-center justify-center space-x-1 mb-1">
                                      <Target className="w-4 h-4 text-red-500" />
                                      <p className={`text-xs ${textColor}`}>Time Dead</p>
                                    </div>
                                    <p className={`font-medium ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                                      {formatGameDuration(match.totalTimeSpentDead)}
                                    </p>
                                  </div>
                                  <div className="text-center">
                                    <div className="flex items-center justify-center space-x-1 mb-1">
                                      <Target className="w-4 h-4 text-yellow-500" />
                                      <p className={`text-xs ${textColor}`}>Longest Alive</p>
                                    </div>
                                    <p className={`font-medium ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                                      {formatGameDuration(match.longestTimeSpentLiving)}
                                    </p>
                                  </div>
                                </div>
                            </div>

                            {/* Healing & Shielding */}
                            <div className="bg-black/20 rounded-lg p-4">
                              <h4 className={`text-lg font-semibold mb-3 ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                                Support & Utility
                              </h4>
                                                              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                  <div className="text-center">
                                    <div className="flex items-center justify-center space-x-1 mb-1">
                                      <Heart className="w-4 h-4 text-red-400" />
                                      <p className={`text-xs ${textColor}`}>Total Heal</p>
                                    </div>
                                    <p className={`font-medium ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                                      {formatNumber(match.totalHeal)}
                                    </p>
                                  </div>
                                  <div className="text-center">
                                    <div className="flex items-center justify-center space-x-1 mb-1">
                                      <Heart className="w-4 h-4 text-pink-400" />
                                      <p className={`text-xs ${textColor}`}>Heals on Allies</p>
                                    </div>
                                    <p className={`font-medium ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                                      {formatNumber(match.totalHealsOnTeammates)}
                                    </p>
                                  </div>
                                  <div className="text-center">
                                    <div className="flex items-center justify-center space-x-1 mb-1">
                                      <Shield className="w-4 h-4 text-blue-400" />
                                      <p className={`text-xs ${textColor}`}>Damage Shielded</p>
                                    </div>
                                    <p className={`font-medium ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                                      {formatNumber(match.totalDamageShieldedOnTeammates)}
                                    </p>
                                  </div>
                                  <div className="text-center">
                                    <div className="flex items-center justify-center space-x-1 mb-1">
                                      <User className="w-4 h-4 text-green-400" />
                                      <p className={`text-xs ${textColor}`}>Units Healed</p>
                                    </div>
                                    <p className={`font-medium ${isZeroCS ? 'text-amber-100' : 'text-white'}`}>
                                      {match.totalUnitsHealed}
                                    </p>
                                  </div>
                                </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
