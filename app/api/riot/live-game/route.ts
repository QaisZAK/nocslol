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
    // Get the live game data using the summoner's PUUID and region
    const gameResponse = await fetch(
      `https://${region}.api.riotgames.com/lol/spectator/v5/active-games/by-summoner/${puuid}`,
      {
        headers: {
          'X-Riot-Token': riotApiKey
        }
      }
    )

    if (!gameResponse.ok) {
      if (gameResponse.status === 404) {
        return NextResponse.json({ error: 'No active game found' }, { status: 404 })
      }
      throw new Error(`Riot API error: ${gameResponse.status}`)
    }

    const gameData = await gameResponse.json()
    
    // Transform the data to match our interface
    const transformedGame = {
      gameId: gameData.gameId,
      gameMode: gameData.gameMode,
      gameType: gameData.gameType,
      mapId: gameData.mapId,
      participants: gameData.participants.map((participant: any) => ({
        summonerName: participant.summonerName,
        championId: participant.championId,
        championName: participant.championName || `Champion ${participant.championId}`,
        teamId: participant.teamId,
        spell1Id: participant.spell1Id,
        spell2Id: participant.spell2Id,
        runes: participant.perks?.perkIds || [],
        rank: participant.rank || 'Unranked',
        level: participant.summonerLevel || 1
      })),
      gameLength: gameData.gameLength,
      platformId: gameData.platformId
    }
    
    return NextResponse.json(transformedGame)
  } catch (error) {
    console.error('Error fetching live game:', error)
    return NextResponse.json(
      { error: 'Failed to fetch live game data' },
      { status: 500 }
    )
  }
}
