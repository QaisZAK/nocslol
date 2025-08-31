import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const puuid = searchParams.get('puuid')
  const region = searchParams.get('region')

  if (!puuid) {
    return NextResponse.json({ error: 'PUUID is required' }, { status: 400 })
  }

  if (!region) {
    return NextResponse.json({ error: 'Region is required' }, { status: 400 })
  }

  const riotApiKey = process.env.RIOT_API_KEY
  if (!riotApiKey) {
    return NextResponse.json({ error: 'Riot API key not configured' }, { status: 500 })
  }

  try {
    // Convert region to routing value for v5 API
    const getRoutingValue = (region: string) => {
      const routingMap: { [key: string]: string } = {
        'na1': 'americas',
        'euw1': 'europe',
        'eun1': 'europe',
        'kr': 'asia',
        'br1': 'americas',
        'la1': 'americas',
        'la2': 'americas',
        'oc1': 'americas',
        'tr1': 'europe',
        'ru': 'europe',
        'jp1': 'asia'
      }
      return routingMap[region] || 'americas'
    }

    const routingValue = getRoutingValue(region)
    
    // Get match IDs for the summoner using v5 routing
    const matchIdsResponse = await fetch(
      `https://${routingValue}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=20`,
      {
        headers: {
          'X-Riot-Token': riotApiKey
        }
      }
    )

    if (!matchIdsResponse.ok) {
      throw new Error(`Failed to get match IDs: ${matchIdsResponse.status}`)
    }

    const matchIds = await matchIdsResponse.json()
    
    console.log(`Found ${matchIds.length} matches for region ${region} (routing: ${routingValue})`)
    console.log('First few match IDs:', matchIds.slice(0, 5))

    // Get detailed match data for each match using v5 routing
    const matchPromises = matchIds.map(async (matchId: string) => {
      const matchResponse = await fetch(
        `https://${routingValue}.api.riotgames.com/lol/match/v5/matches/${matchId}`,
        {
          headers: {
            'X-Riot-Token': riotApiKey
          }
        }
      )

      if (!matchResponse.ok) {
        return null
      }

      return matchResponse.json()
    })

    const matches = await Promise.all(matchPromises)
    const validMatches = matches.filter(match => match !== null)

    console.log(`Processing ${validMatches.length} valid matches...`)
    
    // Filter matches for 0-9 CS and transform data
    const lowCSMatches = validMatches
      .map(match => {
        const participant = match.info.participants.find((p: any) => p.puuid === puuid)
        if (!participant) {
          console.log(`No participant found for PUUID ${puuid} in match ${match.metadata.matchId}`)
          return null
        }

        const cs = participant.totalMinionsKilled + participant.neutralMinionsKilled
        console.log(`Match ${match.metadata.matchId}: ${participant.championName} - CS: ${cs} (minions: ${participant.totalMinionsKilled}, jungle: ${participant.neutralMinionsKilled})`)
        
        if (cs > 9) {
          console.log(`  -> Excluded (CS > 9)`)
          return null
        }
        
                console.log(`  -> Included (CS <= 9)`)
        return {
          matchId: match.metadata.matchId,
          gameCreation: match.info.gameCreation,
          gameDuration: match.info.gameDuration,
          gameMode: match.info.gameMode,
          gameType: match.info.gameType,
          queueId: match.info.queueId,
          championName: participant.championName,
          championId: participant.championId,
          kills: participant.kills,
          deaths: participant.deaths,
          assists: participant.assists,
          cs: cs,
          win: participant.win,
          teamId: participant.teamId,
          summonerName: participant.summonerName,
          items: [
            participant.item0,
            participant.item1,
            participant.item2,
            participant.item3,
            participant.item4,
            participant.item5,
            participant.item6
          ].filter(item => item !== 0)
        }
      })
      .filter(match => match !== null)
      .sort((a, b) => b.gameCreation - a.gameCreation)

    console.log(`Final result: ${lowCSMatches.length} low CS matches found out of ${validMatches.length} total matches`)
    
    return NextResponse.json({
      matches: lowCSMatches,
      totalFound: lowCSMatches.length,
      totalChecked: validMatches.length
    })
  } catch (error) {
    console.error('Error fetching match history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch match history data' },
      { status: 500 }
    )
  }
}
