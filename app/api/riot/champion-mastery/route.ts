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
    // Get champion mastery data
    const masteryResponse = await fetch(
      `https://${region}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}`,
      {
        headers: {
          'X-Riot-Token': riotApiKey
        }
      }
    )

    if (!masteryResponse.ok) {
      console.error(`Mastery API error: ${masteryResponse.status} - ${masteryResponse.statusText}`)
      if (masteryResponse.status === 403) {
        return NextResponse.json({ 
          mastery: [],
          totalChampions: 0,
          totalPoints: 0,
          message: 'API access denied - check API key permissions'
        })
      }
      if (masteryResponse.status === 404) {
        return NextResponse.json({ 
          mastery: [],
          totalChampions: 0,
          totalPoints: 0,
          message: 'No mastery data found'
        })
      }
      // For other errors, return empty data instead of throwing
      return NextResponse.json({ 
        mastery: [],
        totalChampions: 0,
        totalPoints: 0,
        message: `API error: ${masteryResponse.status}`
      })
    }

    const masteryData = await masteryResponse.json()

    // Get champion data to map champion IDs to names
    let championMap: { [key: number]: string } = {}
    try {
      const championResponse = await fetch('https://ddragon.leagueoflegends.com/cdn/latest/data/en_US/champion.json')
      const championData = await championResponse.json()
      
      Object.values(championData.data).forEach((champion: any) => {
        championMap[champion.key] = champion.name
      })
    } catch (error) {
      // Fallback to a known working version
      try {
        const fallbackResponse = await fetch('https://ddragon.leagueoflegends.com/cdn/14.1.1/data/en_US/champion.json')
        const fallbackData = await fallbackResponse.json()
        
        Object.values(fallbackData.data).forEach((champion: any) => {
          championMap[champion.key] = champion.name
        })
      } catch (fallbackError) {
        // Use a minimal fallback map for common champions
        championMap = {
          98: 'Shen', 266: 'Aatrox', 103: 'Ahri', 84: 'Akali', 12: 'Alistar',
          32: 'Amumu', 34: 'Anivia', 1: 'Annie', 523: 'Aphelios', 22: 'Ashe',
          136: 'Aurelion Sol', 268: 'Azir', 432: 'Bard', 200: 'Bel\'Veth',
          53: 'Blitzcrank', 63: 'Brand', 201: 'Braum', 233: 'Briar', 51: 'Caitlyn',
          164: 'Camille', 69: 'Cassiopeia', 31: 'Cho\'Gath', 42: 'Corki',
          122: 'Darius', 131: 'Diana', 119: 'Draven', 36: 'Dr. Mundo',
          245: 'Ekko', 60: 'Elise', 28: 'Evelynn', 81: 'Ezreal', 9: 'Fiddlesticks',
          114: 'Fiora', 105: 'Fizz', 3: 'Galio', 41: 'Gangplank', 86: 'Garen',
          150: 'Gnar', 79: 'Gragas', 104: 'Graves', 887: 'Gwen', 120: 'Hecarim',
          74: 'Heimerdinger', 420: 'Illaoi', 39: 'Irelia', 427: 'Ivern',
          40: 'Janna', 59: 'Jarvan IV', 24: 'Jax', 126: 'Jayce', 202: 'Jhin',
          222: 'Jinx', 145: 'Kai\'Sa', 429: 'Kalista', 43: 'Karma', 30: 'Karthus',
          38: 'Kassadin', 55: 'Katarina', 10: 'Kayle', 141: 'Kayn', 85: 'Kennen',
          121: 'Kha\'Zix', 203: 'Kindred', 240: 'Kled', 96: 'Kog\'Maw',
          7: 'LeBlanc', 64: 'Lee Sin', 89: 'Leona', 876: 'Lillia', 127: 'Lissandra',
          236: 'Lucian', 117: 'Lux', 54: 'Malphite', 90: 'Malzahar', 57: 'Maokai',
          11: 'Master Yi', 21: 'Miss Fortune', 62: 'Wukong', 82: 'Mordekaiser',
          25: 'Morgana', 267: 'Nami', 75: 'Nasus', 111: 'Nautilus', 518: 'Neeko',
          76: 'Nidalee', 56: 'Nocturne', 20: 'Nunu', 2: 'Olaf', 61: 'Orianna',
          516: 'Ornn', 80: 'Pantheon', 78: 'Poppy', 555: 'Pyke', 133: 'Quinn',
          497: 'Rakan', 33: 'Rammus', 421: 'Rek\'Sai', 526: 'Rell', 888: 'Renata Glasc',
          58: 'Renekton', 107: 'Rengar', 92: 'Riven', 68: 'Rumble', 13: 'Ryze',
          360: 'Samira', 113: 'Sejuani', 235: 'Senna', 147: 'Seraphine', 875: 'Sett',
          35: 'Shaco', 102: 'Shyvana', 27: 'Singed', 14: 'Sion', 15: 'Sivir',
          72: 'Skarner', 37: 'Sona', 16: 'Soraka', 50: 'Swain', 517: 'Sylas',
          134: 'Syndra', 223: 'Tahm Kench', 163: 'Taliyah', 91: 'Talon',
          44: 'Taric', 17: 'Teemo', 412: 'Thresh', 18: 'Tristana', 48: 'Trundle',
          23: 'Tryndamere', 4: 'Twisted Fate', 29: 'Twitch', 77: 'Udyr', 6: 'Urgot',
          110: 'Varus', 67: 'Vayne', 45: 'Veigar', 161: 'Vel\'Koz', 711: 'Vex',
          254: 'Vi', 234: 'Viego', 112: 'Viktor', 8: 'Vladimir', 106: 'Volibear',
          19: 'Warwick', 498: 'Xayah', 101: 'Xerath', 5: 'Xin Zhao', 157: 'Yasuo',
          777: 'Yone', 83: 'Yorick', 350: 'Yuumi', 154: 'Zac', 238: 'Zed',
          221: 'Zeri', 115: 'Ziggs', 26: 'Zilean', 142: 'Zoe', 143: 'Zyra',
          804: 'Naafiri', 902: 'Milio'
        }
      }
    }

    // Transform mastery data with champion names
    const transformedMastery = masteryData.map((mastery: any) => ({
      championId: mastery.championId,
      championName: championMap[mastery.championId] || `Champion ${mastery.championId}`,
      championLevel: mastery.championLevel,
      championPoints: mastery.championPoints,
      lastPlayTime: mastery.lastPlayTime,
      championPointsSinceLastLevel: mastery.championPointsSinceLastLevel,
      championPointsUntilNextLevel: mastery.championPointsUntilNextLevel,
      chestGranted: mastery.chestGranted,
      tokensEarned: mastery.tokensEarned,
      summonerId: mastery.summonerId
    }))

    // Sort by champion points (highest first)
    transformedMastery.sort((a: any, b: any) => b.championPoints - a.championPoints)

    return NextResponse.json({
      mastery: transformedMastery,
      totalChampions: transformedMastery.length,
      totalPoints: transformedMastery.reduce((sum: number, champ: any) => sum + champ.championPoints, 0)
    })
  } catch (error) {
    console.error('Error fetching champion mastery:', error)
    return NextResponse.json(
      { error: 'Failed to fetch champion mastery data' },
      { status: 500 }
    )
  }
}
