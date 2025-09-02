'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

interface OverlayData {
  summonerName: string
  region: string
  level: number
  rank: string
  winRate: string
  totalGames: number
  perfectGames: number
  totalCS: number
  jungleMonsters: number
  wardsKilled: number
  monstersSlain: number
  lastUpdated: string
  championMastery?: any[]
  challengesData?: any
  note?: string
}

interface OverlayConfig {
  id: string
  summonerName: string
  region: string
  backgroundColor: string
  textColor: string
  accentColor: string
  showCS: boolean
  showJungleMonsters: boolean
  showWardsKilled: boolean
  showMonstersSlain: boolean
  showRank: boolean
  showLevel: boolean
  showWinRate: boolean
  showChampionMastery: boolean
  showChallenges: boolean
  layout: 'horizontal' | 'vertical' | 'grid'
  size: 'small' | 'medium' | 'large'
  opacity: number
  backgroundOpacity: number
  borderRadius: number
  showBorder: boolean
  borderColor: string
  customTitle: string
  refreshInterval: number
  timeFilter: 'today' | '7d' | '14d' | '30d' | 'all'
}

export default function OverlayPage() {
  const params = useParams()
  const overlayId = params.id as string
  
  const [data, setData] = useState<OverlayData | null>(null)
  const [config, setConfig] = useState<OverlayConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOverlayData = async () => {
      try {
        // Fetch the overlay configuration
        const configResponse = await fetch(`/api/stream-overlay/config?id=${overlayId}`)
        
        if (!configResponse.ok) {
          throw new Error('Overlay configuration not found')
        }
        
        const overlayConfig = await configResponse.json()
        setConfig(overlayConfig)
        
        // Fetch the summoner data
        const dataResponse = await fetch(`/api/stream-overlay/preview?summoner=${encodeURIComponent(overlayConfig.summonerName)}&region=${overlayConfig.region}&timeFilter=${overlayConfig.timeFilter || 'all'}`)
        
        if (dataResponse.ok) {
          const summonerData = await dataResponse.json()
          setData(summonerData)
        } else {
          // Use mock data if API fails
          const mockData: OverlayData = {
            summonerName: overlayConfig.summonerName,
            region: overlayConfig.region,
            level: 156,
            rank: 'Gold IV',
            winRate: '67%',
            totalGames: 45,
            perfectGames: 12,
            totalCS: 0,
            jungleMonsters: 0,
            wardsKilled: 23,
            monstersSlain: 0,
            lastUpdated: new Date().toISOString()
          }
          setData(mockData)
        }
        
        setLoading(false)
      } catch (err) {
        console.error('Error loading overlay:', err)
        setError('Failed to load overlay data')
        setLoading(false)
      }
    }

    fetchOverlayData()

    // Set up auto-refresh
    const interval = setInterval(fetchOverlayData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [overlayId])

  if (loading) {
    return (
      <div className="overlay-content flex items-center justify-center h-32 bg-transparent" style={{ margin: 0, padding: 0, background: 'transparent', width: '100%', height: '100%' }}>
        <div className="text-white bg-black bg-opacity-50 px-4 py-2 rounded">Loading...</div>
      </div>
    )
  }

  if (error || !data || !config) {
    return (
      <div className="overlay-content flex items-center justify-center h-32 bg-transparent" style={{ margin: 0, padding: 0, background: 'transparent', width: '100%', height: '100%' }}>
        <div className="text-red-400 bg-black bg-opacity-50 px-4 py-2 rounded">Error loading overlay</div>
      </div>
    )
  }

  const getSizeClasses = () => {
    switch (config.size) {
      case 'small':
        return 'text-sm p-3'
      case 'large':
        return 'text-lg p-6'
      default:
        return 'text-base p-4'
    }
  }

  const getLayoutClasses = () => {
    switch (config.layout) {
      case 'vertical':
        return 'flex flex-col space-y-2'
      case 'grid':
        return 'grid grid-cols-2 gap-2'
      default:
        return 'flex space-x-4'
    }
  }

  return (
    <div 
      className={`overlay-content ${getSizeClasses()} ${getLayoutClasses()} items-center justify-center relative bg-transparent`}
      style={{
        color: config.textColor,
        opacity: config.opacity,
        borderRadius: `${config.borderRadius}px`,
        border: config.showBorder ? `2px solid ${config.borderColor}` : 'none',
        minHeight: '80px',
        fontFamily: 'Inter, sans-serif',
        margin: 0,
        padding: 0,
        background: 'transparent',
        width: '100%',
        height: '100%',
        position: 'relative',
        zIndex: 9999
      }}
    >
      <div 
        className="absolute inset-0 rounded-lg"
        style={{
          backgroundColor: config.backgroundColor,
          opacity: config.backgroundOpacity || 0.8,
          borderRadius: `${config.borderRadius}px`
        }}
      ></div>
      <div className="relative z-10">
      {/* Title */}
      <div className="text-center mb-2">
        <h2 className="font-bold" style={{ color: config.accentColor }}>
          {config.customTitle}
        </h2>
        <p className="text-xs opacity-70">{data.summonerName}</p>
      </div>

      {/* Stats Grid */}
      <div className={`${getLayoutClasses()} items-center`}>
        {config.showCS && (
          <div className="text-center">
            <div className="font-bold text-xl" style={{ color: config.accentColor }}>
              {data.totalCS}
            </div>
            <div className="text-xs opacity-70">CS</div>
          </div>
        )}
        
        {config.showJungleMonsters && (
          <div className="text-center">
            <div className="font-bold text-xl" style={{ color: config.accentColor }}>
              {data.jungleMonsters}
            </div>
            <div className="text-xs opacity-70">Jungle</div>
          </div>
        )}
        
        {config.showWardsKilled && (
          <div className="text-center">
            <div className="font-bold text-xl" style={{ color: config.accentColor }}>
              {data.wardsKilled}
            </div>
            <div className="text-xs opacity-70">Wards</div>
          </div>
        )}
        
        {config.showMonstersSlain && (
          <div className="text-center">
            <div className="font-bold text-xl" style={{ color: config.accentColor }}>
              {data.monstersSlain}
            </div>
            <div className="text-xs opacity-70">Monsters</div>
          </div>
        )}
        
        {config.showRank && (
          <div className="text-center">
            <div className="font-bold text-lg" style={{ color: config.accentColor }}>
              {data.rank}
            </div>
            <div className="text-xs opacity-70">Rank</div>
          </div>
        )}
        
        {config.showLevel && (
          <div className="text-center">
            <div className="font-bold text-lg" style={{ color: config.accentColor }}>
              {data.level}
            </div>
            <div className="text-xs opacity-70">Level</div>
          </div>
        )}
        
        {config.showWinRate && (
          <div className="text-center">
            <div className="font-bold text-lg" style={{ color: config.accentColor }}>
              {data.winRate}
            </div>
            <div className="text-xs opacity-70">Win Rate</div>
          </div>
        )}
        
        {config.showChampionMastery && data.championMastery && data.championMastery.length > 0 && (
          <div className="text-center">
            <div className="font-bold text-lg" style={{ color: config.accentColor }}>
              {data.championMastery[0].championLevel}
            </div>
            <div className="text-xs opacity-70">Mastery</div>
          </div>
        )}
        
        {config.showChallenges && data.challengesData && (
          <div className="text-center">
            <div className="font-bold text-lg" style={{ color: config.accentColor }}>
              {data.challengesData.totalPoints?.level || 'N/A'}
            </div>
            <div className="text-xs opacity-70">Challenges</div>
          </div>
        )}
      </div>

      {/* Perfect Games Counter */}
      <div className="text-center mt-2">
        <div className="text-xs opacity-70">
          Perfect Games: <span className="font-bold" style={{ color: config.accentColor }}>{data.perfectGames}</span>
        </div>
        {data.totalMatchesFetched && (
          <div className="text-xs opacity-50 mt-1">
            Total Matches: <span className="font-bold" style={{ color: config.accentColor }}>{data.totalMatchesFetched}</span>
          </div>
        )}
        {data.note && (
          <div className="text-xs opacity-50 mt-1">
            {data.note}
          </div>
        )}
      </div>
      </div>
    </div>
  )
}
