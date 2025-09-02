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
    // Get summoner data
    const summonerResponse = await fetch(
      `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
      {
        headers: {
          'X-Riot-Token': riotApiKey
        }
      }
    )

    if (!summonerResponse.ok) {
      console.error(`Account API error: ${summonerResponse.status} - ${summonerResponse.statusText}`)
      if (summonerResponse.status === 403) {
        return NextResponse.json({ 
          error: 'API access denied - check API key permissions'
        }, { status: 403 })
      }
      if (summonerResponse.status === 404) {
        return NextResponse.json({ error: 'Account not found' }, { status: 404 })
      }
      return NextResponse.json({ 
        error: `API error: ${summonerResponse.status}`
      }, { status: summonerResponse.status })
    }

    const summonerData = await summonerResponse.json()

    // Calculate account age and other metrics
    const accountCreationDate = new Date(summonerData.revisionDate)
    const currentDate = new Date()
    const accountAgeInDays = Math.floor((currentDate.getTime() - accountCreationDate.getTime()) / (1000 * 60 * 60 * 24))
    const accountAgeInYears = Math.floor(accountAgeInDays / 365)

    // Get account level tier (based on summoner level)
    const getLevelTier = (level: number) => {
      if (level >= 500) return { tier: 'Legendary', color: 'purple' }
      if (level >= 300) return { tier: 'Veteran', color: 'blue' }
      if (level >= 200) return { tier: 'Experienced', color: 'green' }
      if (level >= 100) return { tier: 'Intermediate', color: 'yellow' }
      if (level >= 50) return { tier: 'Novice', color: 'orange' }
      return { tier: 'Beginner', color: 'red' }
    }

    const levelTier = getLevelTier(summonerData.summonerLevel)

    const transformedAccount = {
      puuid: summonerData.puuid,
      summonerId: summonerData.id,
      accountId: summonerData.accountId,
      name: summonerData.name,
      summonerLevel: summonerData.summonerLevel,
      profileIconId: summonerData.profileIconId,
      revisionDate: summonerData.revisionDate,
      // Calculated fields
      accountAge: {
        days: accountAgeInDays,
        years: accountAgeInYears,
        creationDate: accountCreationDate.toISOString(),
        isActive: accountAgeInDays < 30 // Consider active if played in last 30 days
      },
      levelTier: levelTier,
      // Profile icon URL
      profileIconUrl: `https://ddragon.leagueoflegends.com/cdn/15.17.1/img/profileicon/${summonerData.profileIconId}.png`
    }

    return NextResponse.json(transformedAccount)
  } catch (error) {
    console.error('Error fetching account info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch account information' },
      { status: 500 }
    )
  }
}
