import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const summoner = searchParams.get('summoner')
    const region = searchParams.get('region')
    const timeFilter = searchParams.get('timeFilter') || 'all'

    if (!summoner || !region) {
      return NextResponse.json({ error: 'Missing summoner or region parameter' }, { status: 400 })
    }

    const riotApiKey = process.env.RIOT_API_KEY
    if (!riotApiKey) {
      // Return mock data if no API key is configured
      const mockData = {
        summonerName: summoner,
        region: region,
        level: 156,
        rank: 'Gold IV',
        winRate: '67%',
        totalGames: 45,
        perfectGames: 12,
        totalCS: 0,
        jungleMonsters: 0,
        wardsKilled: 23,
        monstersSlain: 0,
        lastUpdated: new Date().toISOString(),
        isMockData: true
      }
      return NextResponse.json(mockData)
    }

    try {
      // Parse the summoner name (e.g., "0 cs#shen" -> gameName: "0 cs", tagLine: "shen")
      const parts = summoner.split('#')
      if (parts.length !== 2) {
        return NextResponse.json({ error: 'Invalid Riot ID format. Use: GameName#Tagline' }, { status: 400 })
      }
      
      const summonerName = parts[0]
      const tagline = parts[1]
      
      // Get account info
      const accountResponse = await fetch(
        `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(summonerName)}/${encodeURIComponent(tagline)}`,
        {
          headers: {
            'X-Riot-Token': riotApiKey
          }
        }
      )
      
      if (!accountResponse.ok) {
        const errorText = await accountResponse.text()
        console.error(`Account lookup failed for ${summonerName}#${tagline}:`, accountResponse.status, errorText)
        throw new Error(`Account not found: ${accountResponse.status} - ${errorText}`)
      }
      
      const accountData = await accountResponse.json()
      const puuid = accountData.puuid
      
      // Get summoner info from the specified region
      const summonerResponse = await fetch(
        `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
        {
          headers: {
            'X-Riot-Token': riotApiKey
          }
        }
      )
      
      if (!summonerResponse.ok) {
        throw new Error('Summoner not found in specified region')
      }
      
      const summonerData = await summonerResponse.json()
      
      // Get league info
      let leagueData = null
      try {
        const leagueResponse = await fetch(
          `https://${region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerData.id}`,
          {
            headers: {
              'X-Riot-Token': riotApiKey
            }
          }
        )
        
        console.log(`League API response status: ${leagueResponse.status}`)
        
        if (leagueResponse.ok) {
          const leagues = await leagueResponse.json()
          console.log(`League entries found: ${leagues.length}`)
          // Find ranked solo/duo queue
          leagueData = leagues.find((league: any) => league.queueType === 'RANKED_SOLO_5x5')
          if (leagueData) {
            console.log(`League data: ${leagueData.tier} ${leagueData.rank} (${leagueData.leaguePoints} LP)`)
          } else {
            console.log('No ranked solo/duo queue found, using first available league')
            leagueData = leagues[0]
            if (leagueData) {
              console.log(`Using league: ${leagueData.tier} ${leagueData.rank} (${leagueData.leaguePoints} LP)`)
            }
          }
        } else {
          console.log(`League API failed: ${leagueResponse.status}`)
        }
      } catch (err) {
        console.log('Could not fetch league data:', err)
      }
      
      // Get champion mastery data
      let championMastery = null
      try {
        const masteryResponse = await fetch(
          `https://${region}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}/top?count=3`,
          {
            headers: {
              'X-Riot-Token': riotApiKey
            }
          }
        )
        
        if (masteryResponse.ok) {
          championMastery = await masteryResponse.json()
        }
      } catch (err) {
        console.log('Could not fetch champion mastery data:', err)
      }
      
      // Get challenges data
      let challengesData = null
      try {
        const challengesResponse = await fetch(
          `https://${region}.api.riotgames.com/lol/challenges/v1/player-data/${puuid}`,
          {
            headers: {
              'X-Riot-Token': riotApiKey
            }
          }
        )
        
        if (challengesResponse.ok) {
          challengesData = await challengesResponse.json()
        }
      } catch (err) {
        console.log('Could not fetch challenges data:', err)
      }
      
      // Get recent match history to calculate CS statistics
      let matchHistory = []
      let totalCS = 0
      let perfectGames = 0
      let totalGames = 0
      let jungleMonsters = 0
      let wardsKilled = 0
      let monstersSlain = 0
      let wins = 0
      let losses = 0
      
      // Determine the correct regional routing for match history API
      let regionalRouting = 'americas'
      if (region === 'euw1' || region === 'eun1' || region === 'tr1' || region === 'ru') {
        regionalRouting = 'europe'
      } else if (region === 'kr' || region === 'jp1') {
        regionalRouting = 'asia'
      }
      
      // Calculate time filter for match history
      let startTime = 0
      const now = Date.now()
      switch (timeFilter) {
        case 'today':
          startTime = now - (24 * 60 * 60 * 1000) // 24 hours ago
          break
        case '7d':
          startTime = now - (7 * 24 * 60 * 60 * 1000) // 7 days ago
          break
        case '14d':
          startTime = now - (14 * 24 * 60 * 60 * 1000) // 14 days ago
          break
        case '30d':
          startTime = now - (30 * 24 * 60 * 60 * 1000) // 30 days ago
          break
        case 'all':
        default:
          startTime = 0 // All time
          break
      }

      // Check cache first
      let cachedMatches: any[] = []
      try {
        const cacheResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/stream-overlay/cache?puuid=${puuid}`)
        if (cacheResponse.ok) {
          const cacheData = await cacheResponse.json()
          cachedMatches = cacheData.matches || []
          console.log(`Found ${cachedMatches.length} cached matches for PUUID: ${puuid}`)
        }
      } catch (err) {
        console.log('Could not load cached matches:', err)
      }
      
      // For comprehensive data, we'll fetch in batches
      let allMatchIds = []
      
      try {
        console.log(`Fetching match history for PUUID: ${puuid} using ${regionalRouting} routing, timeFilter: ${timeFilter}`)
        let start = 0
        const batchSize = 100
        let hasMoreMatches = true
        
        while (hasMoreMatches) {
          const matchHistoryResponse = await fetch(
            `https://${regionalRouting}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=${start}&count=${batchSize}`,
            {
              headers: {
                'X-Riot-Token': riotApiKey
              }
            }
          )
        
          console.log(`Match history response status: ${matchHistoryResponse.status}`)
          
          if (matchHistoryResponse.ok) {
            const matchIds = await matchHistoryResponse.json()
            
            if (matchIds.length === 0) {
              hasMoreMatches = false
            } else {
              allMatchIds = allMatchIds.concat(matchIds)
              start += batchSize
              
              // If we got fewer matches than requested, we've reached the end
              if (matchIds.length < batchSize) {
                hasMoreMatches = false
              }
            }
          } else {
            hasMoreMatches = false
          }
        }
        
        totalGames = allMatchIds.length
        console.log(`Found ${totalGames} total matches for time filter: ${timeFilter}`)
        
        // Filter matches by time if needed
        let filteredMatchIds = allMatchIds
        if (startTime > 0) {
          // We'll filter by match timestamp after fetching match details
          filteredMatchIds = allMatchIds.slice(0, 50) // Limit to 50 for performance when filtering by time
        } else {
          // For 'all time', we can process more matches
          filteredMatchIds = allMatchIds.slice(0, 100) // Limit to 100 for performance
        }
        
        // Process cached matches first
        const cachedMatchIds = new Set(cachedMatches.map(m => m.matchId))
        let newMatchesToCache: any[] = []
        
        for (const cachedMatch of cachedMatches) {
          const matchData = cachedMatch.data
          
          // Check if match is within time filter
          const matchTimestamp = matchData.info.gameCreation
          if (startTime > 0 && matchTimestamp < startTime) {
            continue // Skip matches outside time filter
          }
          
          // Find the player in the match
          const playerIndex = matchData.metadata.participants.indexOf(puuid)
          if (playerIndex !== -1) {
            const playerStats = matchData.info.participants[playerIndex]
            
            totalCS += playerStats.totalMinionsKilled + playerStats.neutralMinionsKilled
            jungleMonsters += playerStats.neutralMinionsKilled
            wardsKilled += playerStats.wardsKilled
            monstersSlain += playerStats.totalMinionsKilled
            
            // Check if it's a perfect NoCS game
            if (playerStats.totalMinionsKilled === 0 && playerStats.neutralMinionsKilled === 0) {
              perfectGames++
            }
            
            // Track wins and losses
            if (playerStats.win) {
              wins++
            } else {
              losses++
            }
            
            console.log(`Cached Match ${cachedMatch.matchId}: CS=${playerStats.totalMinionsKilled + playerStats.neutralMinionsKilled}, Wards=${playerStats.wardsKilled}, Win=${playerStats.win}`)
          }
        }
        
        // Get detailed match data for new matches only
        const newMatchIds = filteredMatchIds.filter(matchId => !cachedMatchIds.has(matchId))
        console.log(`Processing ${newMatchIds.length} new matches (${cachedMatches.length} cached matches already processed)`)
        
        for (const matchId of newMatchIds) {
          try {
            const matchResponse = await fetch(
              `https://${regionalRouting}.api.riotgames.com/lol/match/v5/matches/${matchId}`,
              {
                headers: {
                  'X-Riot-Token': riotApiKey
                }
              }
            )
            
            if (matchResponse.ok) {
              const matchData = await matchResponse.json()
              
              // Check if match is within time filter
              const matchTimestamp = matchData.info.gameCreation
              if (startTime > 0 && matchTimestamp < startTime) {
                continue // Skip matches outside time filter
              }
              
              // Find the player in the match
              const playerIndex = matchData.metadata.participants.indexOf(puuid)
              if (playerIndex !== -1) {
                const playerStats = matchData.info.participants[playerIndex]
                
                totalCS += playerStats.totalMinionsKilled + playerStats.neutralMinionsKilled
                jungleMonsters += playerStats.neutralMinionsKilled
                wardsKilled += playerStats.wardsKilled
                monstersSlain += playerStats.totalMinionsKilled
                
                // Check if it's a perfect NoCS game
                if (playerStats.totalMinionsKilled === 0 && playerStats.neutralMinionsKilled === 0) {
                  perfectGames++
                }
                
                // Track wins and losses
                if (playerStats.win) {
                  wins++
                } else {
                  losses++
                }
                
                console.log(`New Match ${matchId}: CS=${playerStats.totalMinionsKilled + playerStats.neutralMinionsKilled}, Wards=${playerStats.wardsKilled}, Win=${playerStats.win}`)
                
                // Add to cache
                newMatchesToCache.push({
                  matchId,
                  timestamp: matchTimestamp,
                  data: matchData
                })
              }
            } else {
              console.log(`Failed to fetch match ${matchId}: ${matchResponse.status}`)
            }
          } catch (err) {
            console.log('Error fetching match data:', err)
          }
        }
        
        // Cache new matches
        if (newMatchesToCache.length > 0) {
          try {
            await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/stream-overlay/cache`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                puuid,
                matches: newMatchesToCache,
                lastFetched: Date.now()
              })
            })
            console.log(`Cached ${newMatchesToCache.length} new matches`)
          } catch (err) {
            console.log('Error caching new matches:', err)
          }
        }
      } catch (err) {
        console.log('Could not fetch match history:', err)
      }
      
      // Calculate win rate from match data or use league data as fallback
    let winRate = 'N/A'
    if (wins + losses > 0) {
      const winPercentage = Math.round((wins / (wins + losses)) * 100)
      winRate = `${winPercentage}%`
    } else if (leagueData) {
      const totalGames = leagueData.wins + leagueData.losses
      if (totalGames > 0) {
        const winPercentage = Math.round((leagueData.wins / totalGames) * 100)
        winRate = `${winPercentage}%`
      }
    }
      
      // If no match history found, provide some sample data for demonstration
      let finalData = {
        summonerName: summoner,
        region: region,
        level: summonerData.summonerLevel,
        rank: leagueData ? `${leagueData.tier} ${leagueData.rank}` : 'Unranked',
        winRate: winRate,
        totalGames: totalGames,
        perfectGames: perfectGames,
        totalCS: totalCS,
        jungleMonsters: jungleMonsters,
        wardsKilled: wardsKilled,
        monstersSlain: monstersSlain,
        championMastery: championMastery,
        challengesData: challengesData,
        totalMatchesFetched: (allMatchIds ? allMatchIds.length : 0) + (cachedMatches ? cachedMatches.length : 0),
        lastUpdated: new Date().toISOString(),
        isMockData: false
      }
      
      // If no recent games found, provide some sample NoCS data for demonstration
      if (totalGames === 0) {
        console.log('No recent games found, providing sample NoCS data')
        finalData = {
          ...finalData,
          totalGames: 15,
          perfectGames: 8,
          totalCS: 0, // Perfect for NoCS challenge
          jungleMonsters: 0,
          wardsKilled: 45,
          monstersSlain: 0,
          winRate: '8/15',
          note: 'Sample NoCS data - no recent games found',
          championMastery: championMastery,
          challengesData: challengesData
        }
      } else {
        // Add additional data even when we have match history
        finalData = {
          ...finalData,
          championMastery: championMastery,
          challengesData: challengesData
        }
      }
      
      const data = finalData
      
      return NextResponse.json(data)
      
    } catch (apiError) {
      console.error('Riot API error:', apiError)
      
      // Return mock data if API fails
      const mockData = {
        summonerName: summoner,
        region: region,
        level: 156,
        rank: 'Gold IV',
        winRate: '67%',
        totalGames: 45,
        perfectGames: 12,
        totalCS: 0,
        jungleMonsters: 0,
        wardsKilled: 23,
        monstersSlain: 0,
        lastUpdated: new Date().toISOString(),
        isMockData: true,
        error: `Using mock data due to API error: ${apiError instanceof Error ? apiError.message : 'Unknown error'}`
      }
      return NextResponse.json(mockData)
    }
    
  } catch (error) {
    console.error('Error fetching summoner data:', error)
    return NextResponse.json({ error: 'Failed to fetch summoner data' }, { status: 500 })
  }
}
