'use client'

import { useState, useEffect } from 'react'
import { Monitor, Copy, Eye, Palette, Settings, BarChart3, Users, Target, Zap, Download, RefreshCw } from 'lucide-react'

interface OverlayConfig {
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

export default function StreamToolsPage() {
  const [config, setConfig] = useState<OverlayConfig>({
    summonerName: '',
    region: 'na1',
    backgroundColor: '#1a1a1a',
    textColor: '#c9aa71',
    accentColor: '#f0e6d2',
    showCS: true,
    showJungleMonsters: true,
    showWardsKilled: true,
    showMonstersSlain: true,
    showRank: true,
    showLevel: true,
    showWinRate: true,
    showChampionMastery: true,
    showChallenges: true,
    layout: 'horizontal',
    size: 'medium',
    opacity: 0.9,
    backgroundOpacity: 0.8,
    borderRadius: 8,
    showBorder: true,
    borderColor: '#c9aa71',
    customTitle: 'NoCS Challenge Progress',
    refreshInterval: 30,
    timeFilter: 'all'
  })

  const [overlayUrl, setOverlayUrl] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [previewData, setPreviewData] = useState<any>(null)

  // Remove auto-fetching - user will click "Fetch Data" button instead

  const fetchPreviewData = async () => {
    setIsFetching(true)
    try {
      const response = await fetch(`/api/stream-overlay/preview?summoner=${encodeURIComponent(config.summonerName)}&region=${config.region}&timeFilter=${config.timeFilter}`)
      if (response.ok) {
        const data = await response.json()
        setPreviewData(data)
      }
    } catch (error) {
      console.error('Failed to fetch preview data:', error)
    } finally {
      setIsFetching(false)
    }
  }

  const regions = [
    { value: 'na1', label: 'North America' },
    { value: 'euw1', label: 'Europe West' },
    { value: 'eun1', label: 'Europe Nordic & East' },
    { value: 'kr', label: 'Korea' },
    { value: 'br1', label: 'Brazil' },
    { value: 'la1', label: 'Latin America North' },
    { value: 'la2', label: 'Latin America South' },
    { value: 'jp1', label: 'Japan' },
    { value: 'oc1', label: 'Oceania' },
    { value: 'tr1', label: 'Turkey' },
    { value: 'ru', label: 'Russia' },
    { value: 'ph2', label: 'Philippines' },
    { value: 'sg2', label: 'Singapore' },
    { value: 'th2', label: 'Thailand' },
    { value: 'tw2', label: 'Taiwan' },
    { value: 'vn2', label: 'Vietnam' }
  ]

  const handleConfigChange = (key: keyof OverlayConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  const generateOverlay = async () => {
    if (!config.summonerName.trim()) {
      alert('Please enter a summoner name')
      return
    }

    setIsGenerating(true)
    try {
      // Generate a unique overlay ID
      const overlayId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      
      // Store the configuration
      const overlayConfig = {
        id: overlayId,
        ...config,
        createdAt: new Date().toISOString()
      }

      // Save configuration to API
      const configResponse = await fetch('/api/stream-overlay/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(overlayConfig)
      })

      if (!configResponse.ok) {
        throw new Error('Failed to save overlay configuration')
      }

      // Generate the overlay URL
      const url = `${window.location.origin}/api/stream-overlay/html?id=${overlayId}`
      setOverlayUrl(url)

      // Fetch preview data
      const response = await fetch(`/api/stream-overlay/preview?summoner=${encodeURIComponent(config.summonerName)}&region=${config.region}`)
      if (response.ok) {
        const data = await response.json()
        setPreviewData(data)
      }
    } catch (error) {
      console.error('Error generating overlay:', error)
      alert('Error generating overlay. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(overlayUrl)
    alert('Overlay URL copied to clipboard!')
  }

  const downloadOverlay = () => {
    const link = document.createElement('a')
    link.href = overlayUrl
    link.download = 'nocslol-overlay.html'
    link.click()
  }

  return (
    <div className="min-h-screen bg-lol-darker py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-lol-gold mb-4 text-shadow">
            🎥 Stream Overlay Tools
          </h1>
          <p className="text-lg text-lol-accent/80 max-w-3xl mx-auto mb-4">
            Create custom NoCS challenge overlays for your stream. Show off your zero CS progress in real-time!
          </p>
          
          {/* API Status Info */}
          <div className="bg-lol-dark/50 rounded-lg p-4 border border-lol-gold/30 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-3 h-3 bg-lol-green rounded-full"></div>
              <span className="text-sm font-medium text-lol-accent">Live Data</span>
            </div>
            <p className="text-xs text-lol-accent/70">
              Connected to Riot API! Real summoner data will be fetched automatically.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          <div className="bg-lol-dark rounded-lg p-6 border border-lol-gold/30">
            <h2 className="text-2xl font-bold text-lol-gold mb-6 flex items-center gap-2">
              <Settings className="w-6 h-6" />
              Overlay Configuration
            </h2>

            {/* Summoner Info */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-lol-accent mb-4">Summoner Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-lol-accent/80 mb-2">
                    Summoner Name (e.g., "0 cs#shen")
                  </label>
                  <input
                    type="text"
                    value={config.summonerName}
                    onChange={(e) => handleConfigChange('summonerName', e.target.value)}
                    className="w-full px-4 py-2 bg-lol-darker border border-lol-gold/30 rounded-lg text-lol-accent focus:border-lol-gold focus:outline-none"
                    placeholder="Enter your summoner name"
                  />
                  <button
                    onClick={fetchPreviewData}
                    disabled={!config.summonerName.trim() || !config.region || isFetching}
                    className="w-full mt-2 px-4 py-2 bg-lol-gold text-lol-darker font-semibold rounded-lg hover:bg-lol-gold/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isFetching ? 'Fetching...' : 'Fetch Data'}
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-lol-accent/80 mb-2">
                    Region
                  </label>
                  <select
                    value={config.region}
                    onChange={(e) => handleConfigChange('region', e.target.value)}
                    className="w-full px-4 py-2 bg-lol-darker border border-lol-gold/30 rounded-lg text-lol-accent focus:border-lol-gold focus:outline-none"
                  >
                    {regions.map(region => (
                      <option key={region.value} value={region.value}>
                        {region.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-lol-accent/80 mb-2">
                    Time Filter
                  </label>
                  <select
                    value={config.timeFilter}
                    onChange={(e) => handleConfigChange('timeFilter', e.target.value)}
                    className="w-full px-4 py-2 bg-lol-darker border border-lol-gold/30 rounded-lg text-lol-accent focus:border-lol-gold focus:outline-none"
                  >
                    <option value="today">Today</option>
                    <option value="7d">Last 7 days</option>
                    <option value="14d">Last 14 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="all">All time</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Display Options */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-lol-accent mb-4">Display Options</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'showCS', label: 'CS Score', icon: Target },
                  { key: 'showJungleMonsters', label: 'Jungle Monsters', icon: BarChart3 },
                  { key: 'showWardsKilled', label: 'Wards Killed', icon: Eye },
                  { key: 'showMonstersSlain', label: 'Monsters Slain', icon: Zap },
                  { key: 'showRank', label: 'Current Rank', icon: Users },
                  { key: 'showLevel', label: 'Summoner Level', icon: BarChart3 },
                  { key: 'showWinRate', label: 'Win Rate', icon: BarChart3 },
                  { key: 'showChampionMastery', label: 'Champion Mastery', icon: Target },
                  { key: 'showChallenges', label: 'Challenges Level', icon: Zap }
                ].map(({ key, label, icon: Icon }) => (
                  <label key={key} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config[key as keyof OverlayConfig] as boolean}
                      onChange={(e) => handleConfigChange(key as keyof OverlayConfig, e.target.checked)}
                      className="w-4 h-4 text-lol-gold bg-lol-darker border-lol-gold/30 rounded focus:ring-lol-gold"
                    />
                    <Icon className="w-4 h-4 text-lol-gold" />
                    <span className="text-sm text-lol-accent/80">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Layout & Style */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-lol-accent mb-4">Layout & Style</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-lol-accent/80 mb-2">
                    Layout
                  </label>
                  <select
                    value={config.layout}
                    onChange={(e) => handleConfigChange('layout', e.target.value)}
                    className="w-full px-4 py-2 bg-lol-darker border border-lol-gold/30 rounded-lg text-lol-accent focus:border-lol-gold focus:outline-none"
                  >
                    <option value="horizontal">Horizontal</option>
                    <option value="vertical">Vertical</option>
                    <option value="grid">Grid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-lol-accent/80 mb-2">
                    Size
                  </label>
                  <select
                    value={config.size}
                    onChange={(e) => handleConfigChange('size', e.target.value)}
                    className="w-full px-4 py-2 bg-lol-darker border border-lol-gold/30 rounded-lg text-lol-accent focus:border-lol-gold focus:outline-none"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-lol-accent/80 mb-2">
                    Custom Title
                  </label>
                  <input
                    type="text"
                    value={config.customTitle}
                    onChange={(e) => handleConfigChange('customTitle', e.target.value)}
                    className="w-full px-4 py-2 bg-lol-darker border border-lol-gold/30 rounded-lg text-lol-accent focus:border-lol-gold focus:outline-none"
                    placeholder="Enter custom title"
                  />
                </div>
              </div>
            </div>

            {/* Colors */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-lol-accent mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Colors
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-lol-accent/80 mb-2">
                    Background
                  </label>
                  <input
                    type="color"
                    value={config.backgroundColor}
                    onChange={(e) => handleConfigChange('backgroundColor', e.target.value)}
                    className="w-full h-10 rounded-lg border border-lol-gold/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lol-accent/80 mb-2">
                    Text
                  </label>
                  <input
                    type="color"
                    value={config.textColor}
                    onChange={(e) => handleConfigChange('textColor', e.target.value)}
                    className="w-full h-10 rounded-lg border border-lol-gold/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lol-accent/80 mb-2">
                    Accent
                  </label>
                  <input
                    type="color"
                    value={config.accentColor}
                    onChange={(e) => handleConfigChange('accentColor', e.target.value)}
                    className="w-full h-10 rounded-lg border border-lol-gold/30"
                  />
                </div>
              </div>
            </div>

            {/* Advanced Options */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-lol-accent mb-4">Advanced Options</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-lol-accent/80 mb-2">
                    Overall Opacity: {Math.round(config.opacity * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={config.opacity}
                    onChange={(e) => handleConfigChange('opacity', parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lol-accent/80 mb-2">
                    Background Opacity: {Math.round(config.backgroundOpacity * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={config.backgroundOpacity}
                    onChange={(e) => handleConfigChange('backgroundOpacity', parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lol-accent/80 mb-2">
                    Border Radius: {config.borderRadius}px
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="1"
                    value={config.borderRadius}
                    onChange={(e) => handleConfigChange('borderRadius', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lol-accent/80 mb-2">
                    Refresh Interval: {config.refreshInterval}s
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="120"
                    step="10"
                    value={config.refreshInterval}
                    onChange={(e) => handleConfigChange('refreshInterval', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={config.showBorder}
                    onChange={(e) => handleConfigChange('showBorder', e.target.checked)}
                    className="w-4 h-4 text-lol-gold bg-lol-darker border-lol-gold/30 rounded focus:ring-lol-gold"
                  />
                  <span className="text-sm text-lol-accent/80">Show Border</span>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={generateOverlay}
              disabled={isGenerating || !config.summonerName.trim()}
              className="w-full lol-button text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="inline-block w-5 h-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Monitor className="inline-block w-5 h-5 mr-2" />
                  Generate Overlay
                </>
              )}
            </button>
          </div>

          {/* Preview & Results */}
          <div className="space-y-6">
            {/* Preview */}
            <div className="bg-lol-dark rounded-lg p-6 border border-lol-gold/30">
              <h2 className="text-2xl font-bold text-lol-gold mb-4 flex items-center gap-2">
                <Eye className="w-6 h-6" />
                Preview
              </h2>
              
              {previewData ? (
                <div 
                  className="rounded-lg p-4 border relative"
                  style={{
                    borderColor: config.showBorder ? config.borderColor : 'transparent',
                    opacity: config.opacity,
                    borderRadius: `${config.borderRadius}px`
                  }}
                >
                  <div 
                    className="absolute inset-0 rounded-lg"
                    style={{
                      backgroundColor: config.backgroundColor,
                      opacity: config.backgroundOpacity,
                      borderRadius: `${config.borderRadius}px`
                    }}
                  ></div>
                  <div className="relative z-10"
                >
                  <div className="text-center mb-4">
                    <h3 
                      className="text-lg font-bold"
                      style={{ color: config.accentColor }}
                    >
                      {config.customTitle}
                    </h3>
                    <p 
                      className="text-sm"
                      style={{ color: config.textColor }}
                    >
                      {config.summonerName}
                    </p>
                    {previewData.isMockData && (
                      <p className="text-xs text-red-400 mt-1">
                        ⚠️ Using demo data (Riot API not configured)
                      </p>
                    )}
                    {previewData.note && (
                      <p className="text-xs text-blue-400 mt-1">
                        ℹ️ {previewData.note}
                      </p>
                    )}
                  </div>
                  
                  <div className={`grid gap-4 ${
                    config.layout === 'horizontal' ? 'grid-cols-4' : 
                    config.layout === 'vertical' ? 'grid-cols-1' : 'grid-cols-2'
                  }`}>
                    {config.showCS && (
                      <div className="text-center">
                        <div 
                          className="text-2xl font-bold"
                          style={{ color: config.accentColor }}
                        >
                          {previewData.totalCS}
                        </div>
                        <div 
                          className="text-xs"
                          style={{ color: config.textColor }}
                        >
                          CS
                        </div>
                      </div>
                    )}
                    {config.showJungleMonsters && (
                      <div className="text-center">
                        <div 
                          className="text-2xl font-bold"
                          style={{ color: config.accentColor }}
                        >
                          {previewData.jungleMonsters}
                        </div>
                        <div 
                          className="text-xs"
                          style={{ color: config.textColor }}
                        >
                          Jungle
                        </div>
                      </div>
                    )}
                    {config.showWardsKilled && (
                      <div className="text-center">
                        <div 
                          className="text-2xl font-bold"
                          style={{ color: config.accentColor }}
                        >
                          {previewData.wardsKilled}
                        </div>
                        <div 
                          className="text-xs"
                          style={{ color: config.textColor }}
                        >
                          Wards
                        </div>
                      </div>
                    )}
                    {config.showMonstersSlain && (
                      <div className="text-center">
                        <div 
                          className="text-2xl font-bold"
                          style={{ color: config.accentColor }}
                        >
                          {previewData.monstersSlain}
                        </div>
                        <div 
                          className="text-xs"
                          style={{ color: config.textColor }}
                        >
                          Monsters
                        </div>
                      </div>
                    )}
                    {config.showRank && (
                      <div className="text-center">
                        <div 
                          className="text-lg font-bold"
                          style={{ color: config.accentColor }}
                        >
                          {previewData.rank}
                        </div>
                        <div 
                          className="text-xs"
                          style={{ color: config.textColor }}
                        >
                          Rank
                        </div>
                      </div>
                    )}
                    {config.showLevel && (
                      <div className="text-center">
                        <div 
                          className="text-lg font-bold"
                          style={{ color: config.accentColor }}
                        >
                          {previewData.level}
                        </div>
                        <div 
                          className="text-xs"
                          style={{ color: config.textColor }}
                        >
                          Level
                        </div>
                      </div>
                    )}
                    {config.showWinRate && (
                      <div className="text-center">
                        <div 
                          className="text-lg font-bold"
                          style={{ color: config.accentColor }}
                        >
                          {previewData.winRate}
                        </div>
                        <div 
                          className="text-xs"
                          style={{ color: config.textColor }}
                        >
                          Win Rate
                        </div>
                      </div>
                    )}
                    {config.showChampionMastery && previewData.championMastery && previewData.championMastery.length > 0 && (
                      <div className="text-center">
                        <div 
                          className="text-lg font-bold"
                          style={{ color: config.accentColor }}
                        >
                          {previewData.championMastery[0].championLevel}
                        </div>
                        <div 
                          className="text-xs"
                          style={{ color: config.textColor }}
                        >
                          Mastery
                        </div>
                      </div>
                    )}
                    {config.showChallenges && previewData.challengesData && (
                      <div className="text-center">
                        <div 
                          className="text-lg font-bold"
                          style={{ color: config.accentColor }}
                        >
                          {previewData.challengesData.totalPoints?.level || 'N/A'}
                        </div>
                        <div 
                          className="text-xs"
                          style={{ color: config.textColor }}
                        >
                          Challenges
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-center mt-4">
                    <div 
                      className="text-xs"
                      style={{ color: config.textColor }}
                    >
                      Perfect Games: <span 
                        className="font-bold"
                        style={{ color: config.accentColor }}
                      >
                        {previewData.perfectGames}
                      </span>
                    </div>
                    {previewData.totalMatchesFetched && (
                      <div 
                        className="text-xs mt-1 opacity-70"
                        style={{ color: config.textColor }}
                      >
                        Total Matches: <span 
                          className="font-bold"
                          style={{ color: config.accentColor }}
                        >
                          {previewData.totalMatchesFetched}
                        </span>
                      </div>
                    )}
                  </div>
                  </div>
                </div>
              ) : (
                <div className="bg-lol-darker rounded-lg p-8 border border-lol-gold/20 text-center">
                  <Monitor className="w-12 h-12 text-lol-accent/30 mx-auto mb-4" />
                  <p className="text-lol-accent/60">Generate an overlay to see preview</p>
                </div>
              )}
            </div>

            {/* Overlay URL */}
            {overlayUrl && (
              <div className="bg-lol-dark rounded-lg p-6 border border-lol-gold/30">
                <h2 className="text-2xl font-bold text-lol-gold mb-4 flex items-center gap-2">
                  <Copy className="w-6 h-6" />
                  Overlay URL
                </h2>
                
                <div className="bg-lol-darker rounded-lg p-4 border border-lol-gold/20 mb-4">
                  <code className="text-sm text-lol-accent break-all">{overlayUrl}</code>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={copyToClipboard}
                    className="flex-1 lol-button-secondary"
                  >
                    <Copy className="inline-block w-4 h-4 mr-2" />
                    Copy URL
                  </button>
                  <button
                    onClick={downloadOverlay}
                    className="flex-1 lol-button-secondary"
                  >
                    <Download className="inline-block w-4 h-4 mr-2" />
                    Download
                  </button>
                </div>
                
                <div className="mt-4 p-4 bg-lol-darker/50 rounded-lg border border-lol-gold/20">
                  <h3 className="text-sm font-semibold text-lol-gold mb-2">How to use:</h3>
                  <ol className="text-xs text-lol-accent/80 space-y-1">
                    <li>1. Copy the overlay URL above</li>
                    <li>2. Add it as a Browser Source in OBS Studio</li>
                    <li>3. Set the width to 400px and height to 200px (adjust as needed)</li>
                    <li>4. The overlay will update automatically every {config.refreshInterval} seconds</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
