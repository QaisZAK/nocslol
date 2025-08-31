import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const name = searchParams.get('name')

  if (!name) {
    return NextResponse.json({ error: 'Summoner name is required' }, { status: 400 })
  }

  const riotApiKey = process.env.RIOT_API_KEY
  if (!riotApiKey) {
    return NextResponse.json({ error: 'Riot API key not configured' }, { status: 500 })
  }

  try {
    // Extract the summoner name without the tagline (everything before the #)
    const summonerName = name.split('#')[0]
    const tagline = name.split('#')[1] || ''
    
    // Always use account v1 endpoint first (this works)
    const accountResponse = await fetch(
      `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(summonerName)}/${encodeURIComponent(tagline)}`,
      {
        headers: {
          'X-Riot-Token': riotApiKey
        }
      }
    )
    
    if (!accountResponse.ok) {
      throw new Error('Account not found')
    }
    
    // Account endpoint worked, get the PUUID
    const accountData = await accountResponse.json()
    const puuid = accountData.puuid
    
    // Now find the summoner in different regions using PUUID
    const regions = ['na1', 'euw1', 'eun1', 'kr', 'br1', 'la1', 'la2', 'oc1', 'tr1', 'ru', 'jp1']
    let summonerData
    let foundRegion = null
    
    for (const region of regions) {
      try {
        const summonerResponse = await fetch(
          `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
          {
            headers: {
              'X-Riot-Token': riotApiKey
            }
          }
        )
        
        if (summonerResponse.ok) {
          summonerData = await summonerResponse.json()
          foundRegion = region
          break
        }
      } catch (err) {
        // Continue to next region
        continue
      }
    }
    
    if (!summonerData) {
      throw new Error('Summoner found but not in any League of Legends region')
    }

    // summonerData is already populated from the above logic
    
    return NextResponse.json({
      id: summonerData.id,
      accountId: summonerData.accountId,
      puuid: summonerData.puuid,
      name: summonerData.name,
      profileIconId: summonerData.profileIconId,
      revisionDate: summonerData.revisionDate,
      summonerLevel: summonerData.summonerLevel,
      region: foundRegion
    })
  } catch (error) {
    console.error('Error fetching summoner:', error)
    
    // Check if it's an API key issue
    if (error instanceof Error && error.message.includes('403')) {
      return NextResponse.json(
        { error: 'Invalid or expired Riot API key. Please check your RIOT_API_KEY environment variable.' },
        { status: 403 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch summoner data' },
      { status: 500 }
    )
  }
}
