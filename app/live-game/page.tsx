'use client'

import { useState, useMemo, useEffect } from 'react'
import { Search, Users, Zap, AlertTriangle, CheckCircle, XCircle, Loader2, MapPin, Clock, Trophy, Sword, Shield, Eye, Target, Heart, Filter, ArrowUpDown, Calendar, Target as TargetIcon, TrendingUp, TrendingDown, RefreshCw, Brain, Sparkles } from 'lucide-react'

interface LiveGamePlayer {
  summonerName?: string
  championId: number
  championName?: string
  teamId: number
  spell1Id: number
  spell2Id: number
  runes: any[]
  rank: string
  level: number
}

interface LiveGame {
  gameId: number
  gameMode: string
  gameType: string
  mapId: number
  participants: LiveGamePlayer[]
  gameLength: number
  platformId: string
}

interface MatchHistory {
  matchId: string
  gameCreation: number
  gameDuration: number
  gameMode: string
  gameType: string
  queueId: number
  championName: string
  championId: string
  kills: number
  deaths: number
  assists: number
  cs: number
  win: boolean
  teamId: number
  summonerName: string
  items: number[]
}

interface CachedData {
  summonerName: string
  puuid: string
  region: string
  liveGame: LiveGame | null
  matchHistory: MatchHistory[]
  timestamp: number
  lastRefresh: number
}

interface ChampionCSInfo {
  name: string
  abilities: {
    key: string
    name: string
    givesCS: boolean
    description: string
    notes: string
  }[]
  basicAttacks: {
    givesCS: boolean
    description: string
    notes: string
  }
  strategy: string
}

interface LiveGameAdvice {
  summary: string
  playerTips: string[]
  enemyThreats: string[]
  safeAbilities: string[]
  dangerousAbilities: string[]
  generalStrategy: string[]
}

export default function LiveGamePage() {
  const [summonerName, setSummonerName] = useState('')
  const [liveGame, setLiveGame] = useState<LiveGame | null>(null)
  const [matchHistory, setMatchHistory] = useState<MatchHistory[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [error, setError] = useState<string>('')
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [lastRefresh, setLastRefresh] = useState<number>(0)
  const [refreshCooldown, setRefreshCooldown] = useState<number>(0)
  const [currentSummonerData, setCurrentSummonerData] = useState<{ puuid: string; region: string } | null>(null)
  const [isFromCache, setIsFromCache] = useState<boolean>(false)
  const [championData, setChampionData] = useState<Record<string, ChampionCSInfo>>({})
  const [aiAdvice, setAiAdvice] = useState<LiveGameAdvice | null>(null)
  const [loadingAdvice, setLoadingAdvice] = useState(false)

  // Filter and Sort States
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    result: 'all', // 'all', 'win', 'loss'
    csRange: 'all', // 'all', '0', '1-2', '3-5', '6-9'
    gameMode: 'all', // 'all', 'CLASSIC', 'ARAM', 'URF'
    champion: '',
    dateRange: 'all' // 'all', 'today', 'week', 'month'
  })
  const [sortBy, setSortBy] = useState('date') // 'date', 'cs', 'kda', 'duration', 'champion'
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Load search history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('nocslol-search-history')
    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory)
        setSearchHistory(history.slice(0, 3)) // Keep only last 3
      } catch (error) {
        console.error('Failed to parse search history:', error)
      }
    }
  }, [])

  // Load champion data on mount
  useEffect(() => {
    loadChampionData()
  }, [])

  // Save search history to localStorage
  const saveSearchHistory = (name: string) => {
    const newHistory = [name, ...searchHistory.filter(item => item !== name)].slice(0, 3)
    setSearchHistory(newHistory)
    localStorage.setItem('nocslol-search-history', JSON.stringify(newHistory))
  }

  // Load champion data from JSON
  const loadChampionData = async () => {
    try {
      const response = await fetch('/data/champions.json')
      if (!response.ok) {
        throw new Error(`Failed to fetch champion data: ${response.status}`)
      }
      
      const data = await response.json()
      if (!data || !data.champions || !Array.isArray(data.champions)) {
        throw new Error('Invalid champion data format')
      }
      
      const championMap: Record<string, ChampionCSInfo> = {}
      
      data.champions.forEach((champ: any) => {
        if (champ && champ.name && champ.csMechanics) {
          championMap[champ.name.toLowerCase()] = champ.csMechanics
        }
      })
      
      console.log(`Loaded ${Object.keys(championMap).length} champions with CS mechanics`)
      setChampionData(championMap)
    } catch (error) {
      console.error('Error loading champion data:', error)
      setChampionData({}) // Set empty object to prevent further attempts
    }
  }

  // Get AI advice for live game
  const getAIAdvice = async (liveGame: LiveGame) => {
    if (!liveGame || !liveGame.participants || liveGame.participants.length === 0) {
      console.warn('Invalid live game data for AI advice')
      return
    }

    if (!championData || Object.keys(championData).length === 0) {
      await loadChampionData()
    }

    try {
      setLoadingAdvice(true)
      
      // Debug: Log the live game data structure
      console.log('Live Game Data:', liveGame)
      console.log('Participants:', liveGame.participants)
      console.log('Searching for summoner:', summonerName)
      
      // Find the searched summoner in the game
      // Since the API doesn't return summoner names, we'll use the first player as the searched player
      const searchedPlayer = liveGame.participants[0]
      
      if (!searchedPlayer) {
        console.warn('No participants found in game, skipping AI advice')
        return
      }

      console.log('Using player for AI advice:', searchedPlayer)

      // Validate that we have the required data
      if (!searchedPlayer.championName || !searchedPlayer.teamId) {
        console.warn('Missing required player data for AI advice')
        return
      }

      const playerTeam = liveGame.participants
        .filter(p => p && p.teamId === searchedPlayer.teamId && p.championName)
        .map(p => p.championName)
      
      const enemyTeam = liveGame.participants
        .filter(p => p && p.teamId !== searchedPlayer.teamId && p.championName)
        .map(p => p.championName)

      // Check if we have valid team data
      if (playerTeam.length === 0 || enemyTeam.length === 0) {
        console.warn('Invalid team data for AI advice')
        return
      }

      // Filter champion data to only include champions in the game
      const gameChampionData: Record<string, ChampionCSInfo> = {}
      ;[...playerTeam, ...enemyTeam].forEach(champName => {
        if (champName) {
          const champKey = champName.toLowerCase()
          if (championData[champKey]) {
            gameChampionData[champKey] = championData[champKey]
          }
        }
      })

      // Only proceed if we have some champion data
      if (Object.keys(gameChampionData).length === 0) {
        console.warn('No champion CS data available for AI advice')
        return
      }

      const response = await fetch('/api/gemini/advice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerChampion: searchedPlayer.championName,
          playerTeam,
          enemyTeam,
          championData: gameChampionData
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get AI advice')
      }

      const advice = await response.json()
      setAiAdvice(advice)
    } catch (error) {
      console.error('Error getting AI advice:', error)
      // Don't set error for AI advice failures - it's not critical
    } finally {
      setLoadingAdvice(false)
    }
  }

  // Check cache for existing data
  const getCachedData = (summonerName: string): CachedData | null => {
    if (typeof window === 'undefined') return null
    
    const cached = localStorage.getItem(`nocslol-cache-${summonerName}`)
    if (cached) {
      try {
        const data: CachedData = JSON.parse(cached)
        const now = Date.now()
        const cacheAge = now - data.timestamp
        const refreshAge = now - data.lastRefresh
        
        // Cache is valid for 5 minutes, refresh cooldown is 30 seconds
        if (cacheAge < 5 * 60 * 1000 && refreshAge > 30 * 1000) {
          return data
        }
      } catch (error) {
        console.error('Failed to parse cached data:', error)
      }
    }
    return null
  }

  // Save data to cache
  const saveCachedData = (summonerName: string, data: Omit<CachedData, 'timestamp' | 'lastRefresh'>) => {
    if (typeof window === 'undefined') return
    
    const cacheData: CachedData = {
      ...data,
      timestamp: Date.now(),
      lastRefresh: Date.now()
    }
    localStorage.setItem(`nocslol-cache-${summonerName}`, JSON.stringify(cacheData))
  }

  const searchLiveGame = async (forceRefresh = false) => {
    if (!summonerName.trim()) return

    // Check cache first (unless forcing refresh)
    if (!forceRefresh) {
      const cached = getCachedData(summonerName)
      if (cached) {
        setLiveGame(cached.liveGame)
        setMatchHistory(cached.matchHistory)
        setCurrentSummonerData({ puuid: cached.puuid, region: cached.region })
        setLastRefresh(cached.lastRefresh)
        setError('')
        setIsFromCache(true)
        saveSearchHistory(summonerName)
        // Get AI advice for cached live game
        if (cached.liveGame) {
          getAIAdvice(cached.liveGame)
        }
        return
      }
    }
    
    setIsFromCache(false)

    setLoading(true)
    setError('')
    setLiveGame(null)
    setMatchHistory([])

    try {
      // First, get the summoner's PUUID
      const summonerResponse = await fetch(`/api/riot/summoner?name=${encodeURIComponent(summonerName)}`)
      if (!summonerResponse.ok) {
        throw new Error('Summoner not found or not in game')
      }

      const summonerData = await summonerResponse.json()
      setCurrentSummonerData({ puuid: summonerData.puuid, region: summonerData.region })
      
      // Add to search history
      saveSearchHistory(summonerName)
      
      // Fetch match history for low CS games (always fetch this)
      await fetchMatchHistory(summonerData.puuid, summonerData.region)
      
      // Then try to get the live game data
      const gameResponse = await fetch(`/api/riot/live-game?puuid=${summonerData.puuid}&region=${summonerData.region}`)
      let liveGameData = null
      if (gameResponse.ok) {
        liveGameData = await gameResponse.json()
        setLiveGame(liveGameData)
        // Get AI advice for the live game
        getAIAdvice(liveGameData)
      } else if (gameResponse.status === 404) {
        // No active game, but that's okay - we still have match history
        setError('No active game found for this summoner')
      } else {
        throw new Error(`Failed to get live game data: ${gameResponse.status}`)
      }

      // Cache the results
      saveCachedData(summonerName, {
        summonerName,
        puuid: summonerData.puuid,
        region: summonerData.region,
        liveGame: liveGameData,
        matchHistory: matchHistory
      })

      setLastRefresh(Date.now())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to find live game')
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    if (!currentSummonerData || !summonerName) return
    
    const now = Date.now()
    const timeSinceLastRefresh = now - lastRefresh
    
    // 30 second cooldown
    if (timeSinceLastRefresh < 30000) {
      const remainingCooldown = Math.ceil((30000 - timeSinceLastRefresh) / 1000)
      setRefreshCooldown(remainingCooldown)
      return
    }

    await searchLiveGame(true)
  }

  // Update cooldown timer
  useEffect(() => {
    if (refreshCooldown > 0) {
      const timer = setTimeout(() => {
        setRefreshCooldown(prev => Math.max(0, prev - 1))
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [refreshCooldown])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchLiveGame(false)
    }
  }

  const handleSearchHistoryClick = (name: string) => {
    setSummonerName(name)
    searchLiveGame(false)
  }

  const fetchMatchHistory = async (puuid: string, region: string) => {
    setLoadingHistory(true)
    try {
      const response = await fetch(`/api/riot/match-history?puuid=${puuid}&region=${region}`)
      if (response.ok) {
        const data = await response.json()
        setMatchHistory(data.matches || [])
      }
    } catch (error) {
      console.error('Failed to fetch match history:', error)
    } finally {
      setLoadingHistory(false)
    }
  }

  const getChampionImage = (championName: string) => {
    if (!championName) return ''
    return `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championName}_0.jpg`
  }

  const getChampionPortrait = (championName: string) => {
    if (!championName) return ''
    return `https://ddragon.leagueoflegends.com/cdn/15.17.1/img/champion/${championName}.png`
  }

  // Convert champion ID to name (since the API returns IDs)
  const getChampionName = (championId: number) => {
    const championMap: { [key: number]: string } = {
      98: 'Shen',
      266: 'Aatrox',
      103: 'Ahri',
      84: 'Akali',
      12: 'Alistar',
      32: 'Amumu',
      34: 'Anivia',
      1: 'Annie',
      523: 'Aphelios',
      22: 'Ashe',
      136: 'Aurelion Sol',
      268: 'Azir',
      432: 'Bard',
      200: 'Bel\'Veth',
      53: 'Blitzcrank',
      63: 'Brand',
      201: 'Braum',
      233: 'Briar',
      51: 'Caitlyn',
      164: 'Camille',
      69: 'Cassiopeia',
      31: 'Cho\'Gath',
      42: 'Corki',
      122: 'Darius',
      131: 'Diana',
      119: 'Draven',
      36: 'Dr. Mundo',
      245: 'Ekko',
      60: 'Elise',
      28: 'Evelynn',
      81: 'Ezreal',
      9: 'Fiddlesticks',
      114: 'Fiora',
      105: 'Fizz',
      3: 'Galio',
      41: 'Gangplank',
      86: 'Garen',
      150: 'Gnar',
      79: 'Gragas',
      104: 'Graves',
      887: 'Gwen',
      120: 'Hecarim',
      74: 'Heimerdinger',
      420: 'Illaoi',
      39: 'Irelia',
      427: 'Ivern',
      40: 'Janna',
      59: 'Jarvan IV',
      24: 'Jax',
      126: 'Jayce',
      202: 'Jhin',
      222: 'Jinx',
      145: 'Kai\'Sa',
      429: 'Kalista',
      43: 'Karma',
      30: 'Karthus',
      38: 'Kassadin',
      55: 'Katarina',
      10: 'Kayle',
      141: 'Kayn',
      85: 'Kennen',
      121: 'Kha\'Zix',
      203: 'Kindred',
      240: 'Kled',
      96: 'Kog\'Maw',
      7: 'LeBlanc',
      64: 'Lee Sin',
      89: 'Leona',
      876: 'Lillia',
      127: 'Lissandra',
      236: 'Lucian',
      117: 'Lux',
      54: 'Malphite',
      90: 'Malzahar',
      57: 'Maokai',
      11: 'Master Yi',
      21: 'Miss Fortune',
      62: 'Wukong',
      82: 'Mordekaiser',
      25: 'Morgana',
      267: 'Nami',
      75: 'Nasus',
      111: 'Nautilus',
      518: 'Neeko',
      76: 'Nidalee',
      56: 'Nocturne',
      20: 'Nunu',
      2: 'Olaf',
      61: 'Orianna',
      516: 'Ornn',
      80: 'Pantheon',
      78: 'Poppy',
      555: 'Pyke',
      133: 'Quinn',
      497: 'Rakan',
      33: 'Rammus',
      421: 'Rek\'Sai',
      526: 'Rell',
      888: 'Renata Glasc',
      58: 'Renekton',
      107: 'Rengar',
      92: 'Riven',
      68: 'Rumble',
      13: 'Ryze',
      360: 'Samira',
      113: 'Sejuani',
      235: 'Senna',
      147: 'Seraphine',
      875: 'Sett',
      35: 'Shaco',
      102: 'Shyvana',
      27: 'Singed',
      14: 'Sion',
      15: 'Sivir',
      72: 'Skarner',
      37: 'Sona',
      16: 'Soraka',
      50: 'Swain',
      517: 'Sylas',
      134: 'Syndra',
      223: 'Tahm Kench',
      163: 'Taliyah',
      91: 'Talon',
      44: 'Taric',
      17: 'Teemo',
      412: 'Thresh',
      18: 'Tristana',
      48: 'Trundle',
      23: 'Tryndamere',
      4: 'Twisted Fate',
      29: 'Twitch',
      77: 'Udyr',
      6: 'Urgot',
      110: 'Varus',
      67: 'Vayne',
      45: 'Veigar',
      161: 'Vel\'Koz',
      711: 'Vex',
      254: 'Vi',
      234: 'Viego',
      112: 'Viktor',
      8: 'Vladimir',
      106: 'Volibear',
      19: 'Warwick',
      498: 'Xayah',
      101: 'Xerath',
      5: 'Xin Zhao',
      157: 'Yasuo',
      777: 'Yone',
      83: 'Yorick',
      350: 'Yuumi',
      154: 'Zac',
      238: 'Zed',
      221: 'Zeri',
      115: 'Ziggs',
      26: 'Zilean',
      142: 'Zoe',
      143: 'Zyra'
    }
    return championMap[championId] || `Champion ${championId}`
  }

  const getTeamColor = (teamId: number) => {
    return teamId === 100 ? 'border-lol-blue/50 bg-lol-blue/10' : 'border-lol-red/50 bg-lol-red/10'
  }

  const getTeamName = (teamId: number) => {
    return teamId === 100 ? 'Blue Team' : 'Red Team'
  }

  const formatGameTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getGameModeName = (gameMode: string) => {
    const modeMap: { [key: string]: string } = {
      'CLASSIC': 'Summoner\'s Rift',
      'ARAM': 'Howling Abyss',
      'URF': 'Ultra Rapid Fire',
      'TFT': 'Teamfight Tactics'
    }
    return modeMap[gameMode] || gameMode
  }

  // Filtered and Sorted Match History
  const filteredAndSortedMatches = useMemo(() => {
    let filtered = [...matchHistory]

    // Apply filters
    if (filters.result !== 'all') {
      filtered = filtered.filter(match => 
        filters.result === 'win' ? match.win : !match.win
      )
    }

    if (filters.csRange !== 'all') {
      switch (filters.csRange) {
        case '0':
          filtered = filtered.filter(match => match.cs === 0)
          break
        case '1-2':
          filtered = filtered.filter(match => match.cs >= 1 && match.cs <= 2)
          break
        case '3-5':
          filtered = filtered.filter(match => match.cs >= 3 && match.cs <= 5)
          break
        case '6-9':
          filtered = filtered.filter(match => match.cs >= 6 && match.cs <= 9)
          break
      }
    }

    if (filters.gameMode !== 'all') {
      filtered = filtered.filter(match => match.gameMode === filters.gameMode)
    }

    if (filters.champion) {
      filtered = filtered.filter(match => 
        match.championName.toLowerCase().includes(filters.champion.toLowerCase())
      )
    }

    if (filters.dateRange !== 'all') {
      const now = Date.now()
      const dayMs = 24 * 60 * 60 * 1000
      const weekMs = 7 * dayMs
      const monthMs = 30 * dayMs

      filtered = filtered.filter(match => {
        const matchDate = match.gameCreation
        switch (filters.dateRange) {
          case 'today':
            return (now - matchDate) <= dayMs
          case 'week':
            return (now - matchDate) <= weekMs
          case 'month':
            return (now - matchDate) <= monthMs
          default:
            return true
        }
      })
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortBy) {
        case 'date':
          aValue = a.gameCreation
          bValue = b.gameCreation
          break
        case 'cs':
          aValue = a.cs
          bValue = b.cs
          break
        case 'kda':
          aValue = (a.kills + a.assists) / Math.max(a.deaths, 1)
          bValue = (b.kills + b.assists) / Math.max(b.deaths, 1)
          break
        case 'duration':
          aValue = a.gameDuration
          bValue = b.gameDuration
          break
        case 'champion':
          aValue = a.championName.toLowerCase()
          bValue = b.championName.toLowerCase()
          break
        default:
          aValue = a.gameCreation
          bValue = b.gameCreation
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [matchHistory, filters, sortBy, sortOrder])

  // Helper function to get filter summary
  const getFilterSummary = () => {
    const activeFilters = []
    if (filters.result !== 'all') activeFilters.push(filters.result === 'win' ? 'Wins Only' : 'Losses Only')
    if (filters.csRange !== 'all') {
      const csLabels = { '0': 'Perfect (0 CS)', '1-2': 'Low (1-2 CS)', '3-5': 'Medium (3-5 CS)', '6-9': 'High (6-9 CS)' }
      activeFilters.push(csLabels[filters.csRange as keyof typeof csLabels])
    }
    if (filters.gameMode !== 'all') {
      const modeLabels = { 'CLASSIC': 'Summoner\'s Rift', 'ARAM': 'ARAM', 'URF': 'URF' }
      activeFilters.push(modeLabels[filters.gameMode as keyof typeof modeLabels])
    }
    if (filters.champion) activeFilters.push(`Champion: ${filters.champion}`)
    if (filters.dateRange !== 'all') {
      const dateLabels = { 'today': 'Today', 'week': 'This Week', 'month': 'This Month' }
      activeFilters.push(dateLabels[filters.dateRange as keyof typeof dateLabels])
    }
    return activeFilters
  }

  return (
    <div className="min-h-screen bg-lol-dark">
      {/* Header */}
      <div className="bg-lol-darker border-b border-lol-gold/30 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-5xl font-bold text-lol-gold mb-4 text-shadow">
            Live Game Lookup
          </h1>
          <p className="text-xl text-lol-accent/80">
            Search for a summoner to find their current live game
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Work in Progress Banner */}
        <div className="mb-8 relative overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 p-4 border-4 border-black shadow-lg">
            <div className="flex items-center justify-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-black rounded-full animate-pulse"></div>
                <div className="w-3 h-3 bg-black rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                <div className="w-3 h-3 bg-black rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
              </div>
              <span className="text-black font-bold text-lg tracking-wider uppercase">Work in Progress</span>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-black rounded-full animate-pulse" style={{animationDelay: '0.6s'}}></div>
                <div className="w-3 h-3 bg-black rounded-full animate-pulse" style={{animationDelay: '0.8s'}}></div>
                <div className="w-3 h-3 bg-black rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
              </div>
            </div>
            <div className="mt-2 text-center">
              <span className="text-black font-semibold text-sm">🚧 Live Game Features Under Development 🚧</span>
            </div>
          </div>
          {/* Crime scene tape diagonal stripes */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="w-full h-full" style={{
              background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)'
            }}></div>
          </div>
        </div>

        {/* Search Section */}
        <div className="lol-card p-6 mb-8 bg-lol-darker/50 border border-lol-gold/30">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Enter summoner name (e.g., MeatKebab#HALAL)"
                value={summonerName}
                onChange={(e) => setSummonerName(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 bg-lol-blue/80 border border-lol-gold/30 rounded-lg text-lol-accent placeholder-lol-accent/40 focus:outline-none focus:border-lol-gold/60 font-medium"
              />
            </div>
            <button
              onClick={() => searchLiveGame(false)}
              disabled={loading || !summonerName.trim()}
              className="px-4 py-3 bg-lol-gold text-lol-dark rounded-lg hover:bg-lol-gold/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Search History */}
          {searchHistory.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-lol-gold font-medium mb-2">Recent searches:</p>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((name, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearchHistoryClick(name)}
                    className="px-3 py-1 bg-lol-gold text-lol-dark text-sm rounded hover:bg-lol-gold/80 transition-colors font-medium"
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="lol-card p-6 mb-8 border-2 border-lol-red/30">
            <div className="flex items-center gap-3 text-lol-red">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-semibold">
                {error.includes('No active game found') ? 'Summoner Found - Not in Game' : 'Error'}
              </h3>
            </div>
            <p className="text-lol-accent/80 mt-2">{error}</p>
            <p className="text-lol-accent/60 text-sm mt-2">
              {error.includes('No active game found') 
                ? 'The summoner was found but is not currently in an active game. Try again when they start playing.'
                : 'Make sure the summoner name is correct and they are currently in an active game.'
              }
            </p>
          </div>
        )}

        {/* Live Game Display */}
        {liveGame && (
          <div className="space-y-6">
            {/* Game Info Header */}
            <div className="lol-card p-6 bg-lol-darker/50 border border-lol-gold/30">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <MapPin className="w-6 h-6 text-lol-gold" />
                  <div>
                    <h2 className="text-2xl font-bold text-lol-gold">{getGameModeName(liveGame.gameMode)}</h2>
                    <p className="text-lol-accent/70 font-medium">Game ID: {liveGame.gameId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-lol-accent/60" />
                    <span className="text-lol-accent font-medium">{formatGameTime(liveGame.gameLength)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-lol-accent/60" />
                    <span className="text-lol-accent font-medium">{liveGame.participants.length} players</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Teams */}
            <div className="grid lg:grid-cols-2 gap-6">
                              {/* Blue Team */}
        <div className="lol-card p-6 bg-lol-darker/50 border border-lol-blue/30">
          <h3 className="text-xl font-bold text-lol-blue mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Blue Team
          </h3>
          <div className="space-y-3">
            {liveGame.participants
              .filter(player => player && player.teamId === 100 && player.championName)
              .map((player, index) => {
                console.log('Blue Team Player:', player)
                return (
                  <div key={index} className="flex items-center gap-4 p-4 bg-lol-blue/20 rounded-lg border border-lol-blue/50 hover:bg-lol-blue/30 transition-colors">
                    <div className="relative">
                      <img
                        src={getChampionPortrait(getChampionName(player.championId))}
                        alt={getChampionName(player.championId)}
                        className="w-16 h-16 rounded-lg object-cover border-2 border-lol-blue"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          target.nextElementSibling?.classList.remove('hidden')
                        }}
                      />
                      <div className="hidden w-16 h-16 rounded-lg border-2 border-lol-blue bg-lol-blue flex items-center justify-center text-white font-bold text-lg">
                        {getChampionName(player.championId).charAt(0)}
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-lol-blue text-white text-xs px-2 py-1 rounded-full font-bold">
                        {player.level}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-lol-accent text-lg">{summonerName || 'You'}</div>
                      <div className="text-lol-blue font-semibold text-base">{getChampionName(player.championId)}</div>
                      <div className="text-xs text-lol-accent/70 mt-1 font-medium">{player.rank || 'Unranked'}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-lol-blue font-semibold bg-lol-blue/30 px-3 py-2 rounded-lg border border-lol-blue/50">
                        {player.spell1Id} + {player.spell2Id}
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>

                              {/* Red Team */}
        <div className="lol-card p-6 bg-lol-darker/50 border border-lol-red/30">
          <h3 className="text-xl font-bold text-lol-red mb-4 flex items-center">
            <Sword className="w-5 h-5 mr-2" />
            Red Team
          </h3>
          <div className="space-y-3">
            {liveGame.participants
              .filter(player => player && player.teamId === 200 && player.championName)
              .map((player, index) => {
                console.log('Red Team Player:', player)
                return (
                  <div key={index} className="flex items-center gap-4 p-4 bg-lol-red/20 rounded-lg border border-lol-red/50 hover:bg-lol-red/30 transition-colors">
                    <div className="relative">
                      <img
                        src={getChampionPortrait(getChampionName(player.championId))}
                        alt={getChampionName(player.championId)}
                        className="w-16 h-16 rounded-lg object-cover border-2 border-lol-red"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          target.nextElementSibling?.classList.remove('hidden')
                        }}
                      />
                      <div className="hidden w-16 h-16 rounded-lg border-2 border-lol-red bg-lol-red flex items-center justify-center text-white font-bold text-lg">
                        {getChampionName(player.championId).charAt(0)}
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-lol-red text-white text-xs px-2 py-1 rounded-full font-bold">
                        {player.level}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-lol-accent text-lg">{'Enemy Player'}</div>
                      <div className="text-lol-red font-semibold text-base">{getChampionName(player.championId)}</div>
                      <div className="text-xs text-lol-accent/70 mt-1 font-medium">{player.rank || 'Unranked'}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-lol-red font-semibold bg-lol-red/30 px-3 py-2 rounded-lg border border-lol-red/50">
                        {player.spell1Id} + {player.spell2Id}
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
            </div>

            {/* NoCS Tips for Live Game */}
            <div className="lol-card p-6">
              <h3 className="text-xl font-bold text-lol-gold mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2" />
                NoCS Challenge Tips
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-lol-green mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-lol-accent/80">
                      Focus on champion kills and objective control instead of minion farming
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-lol-green mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-lol-accent/80">
                      Use abilities for utility and mobility, not for clearing waves
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-lol-red mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-lol-accent/80">
                      Avoid any abilities or attacks that might kill minions
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Trophy className="w-5 h-5 text-lol-gold mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-lol-accent/80">
                      Coordinate with your team to secure objectives without minion kills
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* AI-Powered NoCS Advice */}
            {aiAdvice && (
              <div className="lol-card p-6 bg-lol-darker/50 border border-lol-gold/30">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-lol-gold to-yellow-500 rounded-full flex items-center justify-center">
                    <Brain className="w-6 h-6 text-lol-dark" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-lol-gold">AI-Powered NoCS Strategy</h3>
                    <p className="text-sm text-lol-accent/70">Personalized advice for your current game</p>
                  </div>
                </div>

                {/* Summary */}
                <div className="mb-6 p-4 bg-lol-gold/20 rounded-lg border border-lol-gold/30">
                  <p className="text-lol-accent text-center italic font-medium">"{aiAdvice.summary}"</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    {/* Player Tips */}
                    <div>
                      <h4 className="text-lg font-semibold text-lol-gold mb-3 flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2 text-lol-green" />
                        Your Champion Tips
                      </h4>
                      <ul className="space-y-2">
                        {aiAdvice.playerTips.map((tip, index) => (
                          <li key={index} className="flex items-start gap-2 text-lol-accent">
                            <span className="text-lol-green text-sm mt-1 font-bold">•</span>
                            <span className="text-sm font-medium">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Safe Abilities */}
                    <div>
                      <h4 className="text-lg font-semibold text-lol-gold mb-3 flex items-center">
                        <Shield className="w-5 h-5 mr-2 text-lol-green" />
                        Safe Abilities
                      </h4>
                      <ul className="space-y-2">
                        {aiAdvice.safeAbilities.map((ability, index) => (
                          <li key={index} className="flex items-start gap-2 text-lol-accent">
                            <span className="text-lol-green text-sm mt-1 font-bold">•</span>
                            <span className="text-sm font-medium">{ability}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    {/* Enemy Threats */}
                    <div>
                      <h4 className="text-lg font-semibold text-lol-gold mb-3 flex items-center">
                        <AlertTriangle className="w-5 h-5 mr-2 text-lol-red" />
                        Enemy Threats
                      </h4>
                      <ul className="space-y-2">
                        {aiAdvice.enemyThreats.map((threat, index) => (
                          <li key={index} className="flex items-start gap-2 text-lol-accent">
                            <span className="text-lol-red text-sm mt-1 font-bold">•</span>
                            <span className="text-sm font-medium">{threat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Dangerous Abilities */}
                    <div>
                      <h4 className="text-lg font-semibold text-lol-gold mb-3 flex items-center">
                        <XCircle className="w-5 h-5 mr-2 text-lol-red" />
                        Dangerous Abilities
                      </h4>
                      <ul className="space-y-2">
                        {aiAdvice.dangerousAbilities.map((ability, index) => (
                          <li key={index} className="flex items-start gap-2 text-lol-accent">
                            <span className="text-lol-red text-sm mt-1 font-bold">•</span>
                            <span className="text-sm font-medium">{ability}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* General Strategy */}
                <div className="mt-6 p-4 bg-lol-gold/20 rounded-lg border border-lol-gold/20">
                  <h4 className="text-lg font-semibold text-lol-gold mb-3 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2" />
                    General Strategy
                  </h4>
                  <ul className="space-y-2">
                    {aiAdvice.generalStrategy.map((strategy, index) => (
                      <li key={index} className="flex items-start gap-2 text-lol-accent">
                        <span className="text-lol-gold text-sm mt-1 font-bold">•</span>
                        <span className="text-sm font-medium">{strategy}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Loading AI Advice */}
            {loadingAdvice && (
              <div className="lol-card p-6 border-2 border-lol-gold/30">
                <div className="flex items-center justify-center gap-3">
                  <Loader2 className="w-6 h-6 text-lol-gold animate-spin" />
                  <span className="text-lol-gold font-medium">Getting AI-powered NoCS advice...</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Match History Section */}
        {(liveGame || error) && (
          <div className="lol-card p-6 mt-8 bg-lol-darker/50 border border-lol-gold/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-lol-gold flex items-center">
                <Trophy className="w-6 h-6 mr-3" />
                Low CS Match History (0-9 CS)
              </h3>
              
              {/* Refresh Section */}
              <div className="flex items-center gap-3 mt-4 sm:mt-0">
                <div className="text-sm text-lol-accent/70">
                  {lastRefresh > 0 && (
                    <span>
                      Last updated: {new Date(lastRefresh).toLocaleTimeString()}
                      {isFromCache && <span className="text-lol-gold ml-2 font-medium">(cached)</span>}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => refreshData()}
                  disabled={refreshCooldown > 0 || loading}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors font-medium ${
                    refreshCooldown > 0 || loading
                      ? 'bg-lol-accent/20 text-lol-accent/40 cursor-not-allowed'
                      : 'bg-lol-gold text-lol-dark hover:bg-lol-gold/80'
                  }`}
                  title={refreshCooldown > 0 ? `Refresh available in ${refreshCooldown}s` : 'Refresh data'}
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  {refreshCooldown > 0 ? `${refreshCooldown}s` : 'Refresh'}
                </button>
              </div>
            </div>
            
            {loadingHistory ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 text-lol-gold mx-auto mb-4 animate-spin" />
                <p className="text-lol-accent/70 font-medium">Loading match history...</p>
              </div>
            ) : matchHistory.length > 0 ? (
              <div className="space-y-4">
                {/* Filters and Sorting */}
                <div className="bg-lol-darker rounded-lg p-4 border border-lol-gold/40">
                  <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 px-3 py-2 bg-lol-gold text-lol-dark text-sm rounded-lg hover:bg-lol-gold/80 transition-colors border border-lol-gold font-medium"
                      >
                        <Filter className="w-4 h-4" />
                        {showFilters ? 'Hide Filters' : 'Show Filters'}
                      </button>
                      <div className="text-sm text-lol-accent font-medium">
                        Showing {filteredAndSortedMatches.length} of {matchHistory.length} matches
                      </div>
                    </div>
                    
                    {/* Sort Controls */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <ArrowUpDown className="w-4 h-4 text-lol-gold" />
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="bg-lol-dark text-lol-accent text-sm rounded px-3 py-2 border border-lol-gold/60 focus:outline-none focus:border-lol-gold font-medium"
                        >
                          <option value="date">Date</option>
                          <option value="cs">CS</option>
                          <option value="kda">KDA</option>
                          <option value="duration">Duration</option>
                          <option value="champion">Champion</option>
                        </select>
                      </div>
                      <button
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        className="p-2 bg-lol-dark text-lol-gold hover:bg-lol-gold hover:text-lol-dark transition-colors rounded border border-lol-gold/60"
                        title={sortOrder === 'asc' ? 'Sort Descending' : 'Sort Ascending'}
                      >
                        {sortOrder === 'asc' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Filter Panel */}
                  {showFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 pt-4 border-t border-lol-gold/40">
                      {/* Result Filter */}
                      <div>
                        <label className="block text-xs text-lol-gold mb-2 uppercase tracking-wider font-medium">Result</label>
                        <select
                          value={filters.result}
                          onChange={(e) => setFilters(prev => ({ ...prev, result: e.target.value }))}
                          className="w-full bg-lol-dark text-lol-accent text-sm rounded px-3 py-2 border border-lol-gold/60 focus:outline-none focus:border-lol-gold font-medium"
                        >
                          <option value="all">All Results</option>
                          <option value="win">Wins Only</option>
                          <option value="loss">Losses Only</option>
                        </select>
                      </div>

                      {/* CS Range Filter */}
                      <div>
                        <label className="block text-xs text-lol-gold mb-2 uppercase tracking-wider font-medium">CS Range</label>
                        <select
                          value={filters.csRange}
                          onChange={(e) => setFilters(prev => ({ ...prev, csRange: e.target.value }))}
                          className="w-full bg-lol-dark text-lol-accent text-sm rounded px-3 py-2 border border-lol-gold/60 focus:outline-none focus:border-lol-gold font-medium"
                        >
                          <option value="all">All CS</option>
                          <option value="0">Perfect (0 CS)</option>
                          <option value="1-2">Low (1-2 CS)</option>
                          <option value="3-5">Medium (3-5 CS)</option>
                          <option value="6-9">High (6-9 CS)</option>
                        </select>
                      </div>

                      {/* Game Mode Filter */}
                      <div>
                        <label className="block text-xs text-lol-gold mb-2 uppercase tracking-wider font-medium">Game Mode</label>
                        <select
                          value={filters.gameMode}
                          onChange={(e) => setFilters(prev => ({ ...prev, gameMode: e.target.value }))}
                          className="w-full bg-lol-dark text-lol-accent text-sm rounded px-3 py-2 border border-lol-gold/60 focus:outline-none focus:border-lol-gold font-medium"
                        >
                          <option value="all">All Modes</option>
                          <option value="CLASSIC">Summoner's Rift</option>
                          <option value="ARAM">ARAM</option>
                          <option value="URF">URF</option>
                        </select>
                      </div>

                      {/* Champion Filter */}
                      <div>
                        <label className="block text-xs text-lol-gold mb-2 uppercase tracking-wider font-medium">Champion</label>
                        <input
                          type="text"
                          placeholder="Search champion..."
                          value={filters.champion}
                          onChange={(e) => setFilters(prev => ({ ...prev, champion: e.target.value }))}
                          className="w-full bg-lol-dark text-lol-accent text-sm rounded px-3 py-2 border border-lol-gold/60 focus:outline-none focus:border-lol-gold font-medium placeholder-lol-accent/60"
                        />
                      </div>

                      {/* Date Range Filter */}
                      <div>
                        <label className="block text-xs text-lol-gold mb-2 uppercase tracking-wider font-medium">Date Range</label>
                        <select
                          value={filters.dateRange}
                          onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                          className="w-full bg-lol-dark text-lol-accent text-sm rounded px-3 py-2 border border-lol-gold/60 focus:outline-none focus:border-lol-gold font-medium"
                        >
                          <option value="all">All Time</option>
                          <option value="today">Today</option>
                          <option value="week">This Week</option>
                          <option value="month">This Month</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Filter Summary */}
                  {getFilterSummary().length > 0 && (
                    <div className="pt-4 border-t border-lol-gold/40">
                      <div className="flex items-center gap-2 mb-3">
                        <Filter className="w-4 h-4 text-lol-gold" />
                        <span className="text-sm text-lol-gold font-medium">Active Filters:</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {getFilterSummary().map((filter, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-lol-gold text-lol-dark text-xs rounded font-medium border border-lol-gold"
                          >
                            {filter}
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={() => setFilters({
                          result: 'all',
                          csRange: 'all',
                          gameMode: 'all',
                          champion: '',
                          dateRange: 'all'
                        })}
                        className="px-4 py-2 bg-lol-red text-lol-dark text-sm rounded-lg hover:bg-lol-red/80 transition-colors border border-lol-red font-medium"
                      >
                        Clear All Filters
                      </button>
                    </div>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-lol-darker rounded-lg p-3 border border-lol-gold/40 text-center">
                    <div className="text-xs text-lol-gold uppercase tracking-wider mb-1 font-medium">Total Matches</div>
                    <div className="text-lg font-bold text-lol-accent">{filteredAndSortedMatches.length}</div>
                  </div>
                  <div className="bg-lol-darker rounded-lg p-3 border border-lol-gold/40 text-center">
                    <div className="text-xs text-lol-gold uppercase tracking-wider mb-1 font-medium">Perfect (0 CS)</div>
                    <div className="text-lg font-bold text-lol-green">
                      {filteredAndSortedMatches.filter(m => m.cs === 0).length}
                    </div>
                  </div>
                  <div className="bg-lol-darker rounded-lg p-3 border border-lol-gold/40 text-center">
                    <div className="text-xs text-lol-gold uppercase tracking-wider mb-1 font-medium">Win Rate</div>
                    <div className="text-lg font-bold text-lol-accent">
                      {filteredAndSortedMatches.length > 0 
                        ? `${Math.round((filteredAndSortedMatches.filter(m => m.win).length / filteredAndSortedMatches.length) * 100)}%`
                        : '0%'
                      }
                    </div>
                  </div>
                  <div className="bg-lol-darker rounded-lg p-3 border border-lol-gold/40 text-center">
                    <div className="text-xs text-lol-gold uppercase tracking-wider mb-1 font-medium">Avg CS</div>
                    <div className="text-lg font-bold text-lol-accent">
                      {filteredAndSortedMatches.length > 0 
                        ? (filteredAndSortedMatches.reduce((sum, m) => sum + m.cs, 0) / filteredAndSortedMatches.length).toFixed(1)
                        : '0.0'
                      }
                    </div>
                  </div>
                </div>

                <div className="text-sm text-lol-accent font-medium mb-4">
                  {filteredAndSortedMatches.length === matchHistory.length 
                    ? `Found ${matchHistory.length} games with 0-9 CS in recent matches`
                    : `Showing ${filteredAndSortedMatches.length} of ${matchHistory.length} matches`
                  }
                </div>
                {filteredAndSortedMatches.map((match) => (
                  <div key={match.matchId} className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 hover:scale-[1.02] ${
                    match.win 
                      ? 'bg-gradient-to-br from-lol-green/20 via-lol-green/10 to-lol-green/5 border-lol-green/40 shadow-lg shadow-lol-green/20' 
                      : 'bg-gradient-to-br from-lol-red/20 via-lol-red/10 to-lol-red/5 border-lol-red/40 shadow-lg shadow-lol-red/20'
                  }`}>
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-5">
                      <div className="absolute top-0 right-0 w-32 h-32 transform rotate-12">
                        <div className={`w-full h-full ${match.win ? 'bg-lol-green' : 'bg-lol-red'} rounded-full blur-xl`}></div>
                      </div>
                    </div>
                    
                    {/* Header Section */}
                    <div className="relative p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          {/* Champion Image with Glow */}
                          <div className={`relative ${match.win ? 'shadow-lg shadow-lol-green/30' : 'shadow-lg shadow-lol-red/30'}`}>
                            <img
                              src={getChampionImage(match.championName)}
                              alt={match.championName}
                              className="w-16 h-16 rounded-xl object-cover border-2 border-lol-gold/30"
                            />
                            <div className={`absolute inset-0 rounded-xl ${match.win ? 'bg-lol-green/20' : 'bg-lol-red/20'} opacity-0 hover:opacity-100 transition-opacity duration-200`}></div>
                          </div>
                          
                          {/* Champion Info */}
                          <div>
                            <div className="text-xl font-bold text-lol-gold mb-1">{match.championName}</div>
                            <div className="text-sm text-lol-accent/70 font-medium">{match.gameMode}</div>
                            <div className="text-xs text-lol-accent/50 mt-1">
                              {new Date(match.gameCreation).toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </div>
                        
                        {/* Result Badge */}
                        <div className="text-right">
                          <div className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider ${
                            match.win 
                              ? 'bg-lol-green/20 text-lol-green border border-lol-green/40' 
                              : 'bg-lol-red/20 text-lol-red border border-lol-red/40'
                          }`}>
                            {match.win ? 'Victory' : 'Defeat'}
                          </div>
                          <div className={`mt-2 text-2xl font-bold ${match.win ? 'text-lol-green' : 'text-lol-red'}`}>
                            {match.win ? '🏆' : '💀'}
                          </div>
                        </div>
                      </div>
                      
                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {/* KDA */}
                        <div className="text-center group">
                          <div className="text-xs text-lol-accent/60 uppercase tracking-wider font-medium mb-1">KDA</div>
                          <div className="text-lg font-bold text-lol-gold group-hover:text-lol-accent transition-colors">
                            {match.kills}/{match.deaths}/{match.assists}
                          </div>
                          <div className="text-xs text-lol-accent/50 mt-1">
                            {match.deaths === 0 ? 'Perfect' : `${((match.kills + match.assists) / Math.max(match.deaths, 1)).toFixed(1)} KDA`}
                          </div>
                        </div>
                        
                                                 {/* CS */}
                         <div className="text-center group">
                           <div className="text-xs text-lol-accent/60 uppercase tracking-wider font-medium mb-1">CS</div>
                           <div className="text-lg font-bold text-lol-gold group-hover:text-lol-accent transition-colors">
                             {match.cs}
                           </div>
                           <div className="text-xs text-lol-accent/50 mt-1">
                             {match.cs === 0 ? '🎯 Perfect NoCS!' : 
                              match.cs <= 2 ? '⚠️ Low CS' : 
                              match.cs <= 5 ? '❌ Medium CS' : 
                              match.cs <= 9 ? '💀 High CS' : '🔥 Over Limit'}
                           </div>
                         </div>
                        
                        {/* Duration */}
                        <div className="text-center group">
                          <div className="text-xs text-lol-accent/60 uppercase tracking-wider font-medium mb-1">Duration</div>
                          <div className="text-lg font-bold text-lol-gold group-hover:text-lol-accent transition-colors">
                            {Math.floor(match.gameDuration / 60)}:{String(match.gameDuration % 60).padStart(2, '0')}
                          </div>
                          <div className="text-xs text-lol-accent/50 mt-1">
                            {match.gameDuration < 1200 ? 'Quick Game' : match.gameDuration < 1800 ? 'Standard' : 'Long Game'}
                          </div>
                        </div>
                        
                        {/* Items */}
                        <div className="text-center group">
                          <div className="text-xs text-lol-accent/60 uppercase tracking-wider font-medium mb-1">Items</div>
                          <div className="text-lg font-bold text-lol-gold group-hover:text-lol-accent transition-colors">
                            {match.items.length}
                          </div>
                          <div className="text-xs text-lol-accent/50 mt-1">
                            {match.items.length >= 6 ? 'Full Build' : `${6 - match.items.length} slots left`}
                          </div>
                        </div>
                      </div>
                      
                                             {/* CS Progress Bar - Goal is 0 CS */}
                       <div className="mt-4">
                         <div className="flex items-center justify-between text-xs text-lol-accent/60 mb-1">
                           <span>CS Performance</span>
                           <span>{match.cs} CS (Goal: 0)</span>
                         </div>
                         <div className="w-full bg-lol-dark/50 rounded-full h-2 overflow-hidden">
                           <div 
                             className={`h-full rounded-full transition-all duration-500 ${
                               match.cs === 0 ? 'bg-lol-green' : 
                               match.cs <= 2 ? 'bg-lol-gold' : 
                               match.cs <= 5 ? 'bg-lol-blue' : 
                               match.cs <= 9 ? 'bg-lol-accent' : 'bg-lol-red'
                             }`}
                             style={{ width: `${Math.max(100 - (match.cs / 10) * 100, 0)}%` }}
                           ></div>
                         </div>
                         <div className="text-xs text-lol-accent/50 mt-1 text-center">
                           {match.cs === 0 ? '🎯 Perfect NoCS Challenge!' : 
                            match.cs <= 2 ? '⚠️ Low CS - Could be worse' : 
                            match.cs <= 5 ? '❌ Medium CS - Not good' : 
                            match.cs <= 9 ? '💀 High CS - Almost failed' : '🔥 Over Limit - Failed Challenge'}
                         </div>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Trophy className="w-16 h-16 text-lol-gold/40 mx-auto mb-4" />
                <p className="text-lol-accent/60 text-lg">
                  {filteredAndSortedMatches.length === 0 && matchHistory.length > 0 
                    ? 'No matches match your current filters' 
                    : 'No low CS games found'
                  }
                </p>
                <p className="text-lol-accent/40 text-sm mt-2">
                  {filteredAndSortedMatches.length === 0 && matchHistory.length > 0 
                    ? 'Try adjusting your filters or clearing them to see all available matches.'
                    : 'This summoner hasn\'t played any games with 0-9 CS in their recent history.'
                  }
                </p>
                {filteredAndSortedMatches.length === 0 && matchHistory.length > 0 && (
                  <button
                    onClick={() => setFilters({
                      result: 'all',
                      csRange: 'all',
                      gameMode: 'all',
                      champion: '',
                      dateRange: 'all'
                    })}
                    className="mt-4 px-6 py-2 bg-lol-gold/20 text-lol-gold text-sm rounded-lg hover:bg-lol-gold/40 transition-colors border border-lol-gold/30"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Initial State */}
        {!liveGame && !error && !loading && (
          <div className="lol-card p-12 text-center">
            <Search className="w-16 h-16 text-lol-accent/40 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-lol-gold mb-2">Ready to Look Up a Game?</h3>
            <p className="text-lol-accent/60">
              Enter a summoner name above to find their current live game and get NoCS strategy tips.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
