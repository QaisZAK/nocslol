import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const CACHE_DIR = path.join(process.cwd(), 'data', 'match-cache')
const CACHE_FILE = path.join(CACHE_DIR, 'matches.json')

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true })
}

interface CachedMatch {
  matchId: string
  timestamp: number
  data: any
}

interface CachedSummoner {
  puuid: string
  lastFetched: number
  matches: CachedMatch[]
}

interface MatchCache {
  summoners: { [puuid: string]: CachedSummoner }
}

function loadCache(): MatchCache {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const data = fs.readFileSync(CACHE_FILE, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error loading match cache:', error)
  }
  return { summoners: {} }
}

function saveCache(cache: MatchCache) {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2))
  } catch (error) {
    console.error('Error saving match cache:', error)
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const puuid = searchParams.get('puuid')
  
  if (!puuid) {
    return NextResponse.json({ error: 'Missing puuid parameter' }, { status: 400 })
  }

  const cache = loadCache()
  const summonerCache = cache.summoners[puuid]
  
  if (!summonerCache) {
    return NextResponse.json({ matches: [], lastFetched: null })
  }

  return NextResponse.json({
    matches: summonerCache.matches,
    lastFetched: summonerCache.lastFetched
  })
}

export async function POST(request: NextRequest) {
  try {
    const { puuid, matches, lastFetched } = await request.json()
    
    if (!puuid || !matches || !Array.isArray(matches)) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }

    const cache = loadCache()
    
    // Get existing matches for this summoner
    const existingMatches = cache.summoners[puuid]?.matches || []
    const existingMatchIds = new Set(existingMatches.map(m => m.matchId))
    
    // Add only new matches
    const newMatches = matches.filter((match: any) => !existingMatchIds.has(match.matchId))
    
    if (newMatches.length > 0) {
      console.log(`Caching ${newMatches.length} new matches for PUUID: ${puuid}`)
      
      cache.summoners[puuid] = {
        puuid,
        lastFetched: lastFetched || Date.now(),
        matches: [...existingMatches, ...newMatches.map((match: any) => ({
          matchId: match.matchId,
          timestamp: match.timestamp || Date.now(),
          data: match.data
        }))]
      }
      
      saveCache(cache)
    }
    
    return NextResponse.json({ 
      success: true, 
      newMatchesCached: newMatches.length,
      totalMatches: cache.summoners[puuid].matches.length
    })
  } catch (error) {
    console.error('Error caching matches:', error)
    return NextResponse.json({ error: 'Failed to cache matches' }, { status: 500 })
  }
}
