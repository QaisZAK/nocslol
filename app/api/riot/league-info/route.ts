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
    // First get the summoner ID using the PUUID
    const summonerResponse = await fetch(
      `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
      {
        headers: {
          'X-Riot-Token': riotApiKey
        }
      }
    )

    if (!summonerResponse.ok) {
      console.error(`Summoner API error: ${summonerResponse.status} - ${summonerResponse.statusText}`)
      if (summonerResponse.status === 403) {
        return NextResponse.json({ 
          leagueInfo: [],
          totalQueues: 0,
          message: 'API access denied - check API key permissions'
        })
      }
      if (summonerResponse.status === 404) {
        return NextResponse.json({ 
          leagueInfo: [],
          totalQueues: 0,
          message: 'Summoner not found'
        })
      }
      throw new Error(`Failed to get summoner: ${summonerResponse.status}`)
    }

    const summonerData = await summonerResponse.json()
    const summonerId = summonerData.id

    // Now get the league information using the summoner ID
    const leagueResponse = await fetch(
      `https://${region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}`,
      {
        headers: {
          'X-Riot-Token': riotApiKey
        }
      }
    )

    if (!leagueResponse.ok) {
      console.error(`League API error: ${leagueResponse.status} - ${leagueResponse.statusText}`)
      if (leagueResponse.status === 403) {
        return NextResponse.json({ 
          leagueInfo: [],
          totalQueues: 0,
          message: 'API access denied - check API key permissions'
        })
      }
      if (leagueResponse.status === 404) {
        return NextResponse.json({ 
          leagueInfo: [],
          totalQueues: 0,
          message: 'No ranked data found - summoner may be unranked'
        })
      }
      // For other errors, return empty data instead of throwing
      return NextResponse.json({ 
        leagueInfo: [],
        totalQueues: 0,
        message: `API error: ${leagueResponse.status}`
      })
    }

    const leagueData = await leagueResponse.json()

    // Transform league data
    const transformedLeague = leagueData.map((entry: any) => ({
      queueType: entry.queueType,
      queueName: getQueueName(entry.queueType),
      tier: entry.tier,
      rank: entry.rank,
      leaguePoints: entry.leaguePoints,
      wins: entry.wins,
      losses: entry.losses,
      winRate: entry.wins + entry.losses > 0 ? ((entry.wins / (entry.wins + entry.losses)) * 100).toFixed(1) : '0.0',
      totalGames: entry.wins + entry.losses,
      leagueId: entry.leagueId,
      summonerId: entry.summonerId,
      summonerName: entry.summonerName,
      hotStreak: entry.hotStreak,
      veteran: entry.veteran,
      freshBlood: entry.freshBlood,
      inactive: entry.inactive,
      miniSeries: entry.miniSeries
    }))

    // Sort by queue type (Solo/Duo first, then Flex, then others)
    transformedLeague.sort((a: any, b: any) => {
      const queueOrder = {
        'RANKED_SOLO_5x5': 1,
        'RANKED_FLEX_SR': 2,
        'RANKED_TFT': 3,
        'RANKED_TFT_TURBO': 4,
        'RANKED_TFT_DOUBLE_UP': 5
      }
      return (queueOrder[a.queueType as keyof typeof queueOrder] || 999) - (queueOrder[b.queueType as keyof typeof queueOrder] || 999)
    })

    return NextResponse.json({
      leagueInfo: transformedLeague,
      totalQueues: transformedLeague.length,
      summonerName: summonerData.name
    })
  } catch (error) {
    console.error('Error fetching league info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch league information' },
      { status: 500 }
    )
  }
}

function getQueueName(queueType: string): string {
  const queueNames: { [key: string]: string } = {
    'RANKED_SOLO_5x5': 'Ranked Solo/Duo',
    'RANKED_FLEX_SR': 'Ranked Flex',
    'RANKED_TFT': 'Ranked TFT',
    'RANKED_TFT_TURBO': 'Ranked TFT Turbo',
    'RANKED_TFT_DOUBLE_UP': 'Ranked TFT Double Up'
  }
  return queueNames[queueType] || queueType
}
