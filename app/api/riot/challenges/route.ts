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
    // Get player challenge data
    const challengesResponse = await fetch(
      `https://${region}.api.riotgames.com/lol/challenges/v1/player-data/${puuid}`,
      {
        headers: {
          'X-Riot-Token': riotApiKey
        }
      }
    )

    if (!challengesResponse.ok) {
      console.error(`Challenges API error: ${challengesResponse.status} - ${challengesResponse.statusText}`)
      if (challengesResponse.status === 403) {
        return NextResponse.json({ 
          challenges: [],
          totalChallenges: 0,
          message: 'API access denied - check API key permissions'
        })
      }
      if (challengesResponse.status === 404) {
        return NextResponse.json({ 
          challenges: [],
          totalChallenges: 0,
          message: 'No challenge data found'
        })
      }
      // For other errors, return empty data instead of throwing
      return NextResponse.json({ 
        challenges: [],
        totalChallenges: 0,
        message: `API error: ${challengesResponse.status}`
      })
    }

    const challengesData = await challengesResponse.json()

    // Get challenge configurations for names and descriptions
    let challengeConfigs: { [key: string]: any } = {}
    try {
      const configResponse = await fetch(
        `https://${region}.api.riotgames.com/lol/challenges/v1/challenges/config`,
        {
          headers: {
            'X-Riot-Token': riotApiKey
          }
        }
      )
      
      if (configResponse.ok) {
        const configData = await configResponse.json()
        configData.forEach((config: any) => {
          challengeConfigs[config.id] = config
        })
      }
    } catch (error) {
      console.warn('Failed to fetch challenge configurations:', error)
    }

    // Transform challenge data
    const transformedChallenges = challengesData.challenges.map((challenge: any) => {
      const config = challengeConfigs[challenge.challengeId] || {}
      return {
        challengeId: challenge.challengeId,
        name: config.localizedNames?.en_US || `Challenge ${challenge.challengeId}`,
        description: config.localizedDescriptions?.en_US || 'No description available',
        value: challenge.value,
        level: challenge.level,
        maxLevel: challenge.maxLevel,
        percentile: challenge.percentile,
        category: config.category || 'Unknown',
        thresholds: config.thresholds || {},
        state: challenge.state || 'ENABLED'
      }
    })

    // Sort by level (highest first), then by percentile
    transformedChallenges.sort((a: any, b: any) => {
      if (b.level !== a.level) {
        return b.level - a.level
      }
      return (b.percentile || 0) - (a.percentile || 0)
    })

    // Calculate summary statistics
    const totalChallenges = transformedChallenges.length
    const completedChallenges = transformedChallenges.filter((c: any) => c.level > 0).length
    const maxLevelChallenges = transformedChallenges.filter((c: any) => c.level === c.maxLevel).length
    const averageLevel = totalChallenges > 0 ? 
      (transformedChallenges.reduce((sum: number, c: any) => sum + c.level, 0) / totalChallenges).toFixed(1) : '0.0'

    return NextResponse.json({
      challenges: transformedChallenges,
      totalChallenges,
      completedChallenges,
      maxLevelChallenges,
      averageLevel,
      summary: {
        total: totalChallenges,
        completed: completedChallenges,
        maxLevel: maxLevelChallenges,
        averageLevel: parseFloat(averageLevel)
      }
    })
  } catch (error) {
    console.error('Error fetching challenges:', error)
    return NextResponse.json(
      { error: 'Failed to fetch challenges data' },
      { status: 500 }
    )
  }
}
