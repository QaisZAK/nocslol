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
      console.error(`Live game API error: ${gameResponse.status} - ${gameResponse.statusText}`)
      if (gameResponse.status === 403) {
        return NextResponse.json({ 
          error: 'API access denied - check API key permissions'
        }, { status: 403 })
      }
      if (gameResponse.status === 404) {
        return NextResponse.json({ error: 'No active game found' }, { status: 404 })
      }
      // For other errors, return error instead of throwing
      return NextResponse.json({ 
        error: `API error: ${gameResponse.status}`
      }, { status: gameResponse.status })
    }

    const gameData = await gameResponse.json()
    
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

    // Get summoner spell data
    let summonerSpellMap: { [key: number]: { name: string; imageUrl: string } } = {}
    try {
      const spellResponse = await fetch('https://ddragon.leagueoflegends.com/cdn/15.17.1/data/en_US/summoner.json')
      if (!spellResponse.ok) {
        throw new Error(`HTTP error! status: ${spellResponse.status}`)
      }
      const spellData = await spellResponse.json()
      
      if (spellData.data) {
        Object.values(spellData.data).forEach((spell: any) => {
          summonerSpellMap[spell.key] = {
            name: spell.name,
            imageUrl: `https://ddragon.leagueoflegends.com/cdn/15.17.1/img/spell/${spell.image.full}`
          }
        })
      }
    } catch (error) {
      console.warn('Failed to fetch summoner spell data:', error)
      // Fallback to basic spell mapping
      summonerSpellMap = {
        4: { name: 'Flash', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/15.17.1/img/spell/SummonerFlash.png' },
        6: { name: 'Ghost', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/15.17.1/img/spell/SummonerHaste.png' },
        7: { name: 'Heal', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/15.17.1/img/spell/SummonerHeal.png' },
        11: { name: 'Smite', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/15.17.1/img/spell/SummonerSmite.png' },
        12: { name: 'Teleport', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/15.17.1/img/spell/SummonerTeleport.png' },
        13: { name: 'Clarity', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/15.17.1/img/spell/SummonerMana.png' },
        14: { name: 'Ignite', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/15.17.1/img/spell/SummonerDot.png' },
        21: { name: 'Barrier', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/15.17.1/img/spell/SummonerBarrier.png' },
        32: { name: 'Mark', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/15.17.1/img/spell/SummonerSnowball.png' },
        39: { name: 'Mark', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/15.17.1/img/spell/SummonerSnowball.png' },
        3: { name: 'Exhaust', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/15.17.1/img/spell/SummonerExhaust.png' },
        1: { name: 'Cleanse', imageUrl: 'https://ddragon.leagueoflegends.com/cdn/15.17.1/img/spell/SummonerBoost.png' }
      }
    }

    // Transform the data with enhanced information
    const transformedGame = {
      gameId: gameData.gameId,
      gameMode: gameData.gameMode,
      gameType: gameData.gameType,
      mapId: gameData.mapId,
      gameLength: gameData.gameLength,
      platformId: gameData.platformId,
      gameStartTime: gameData.gameStartTime,
      queueId: gameData.queueId,
      participants: await Promise.all(gameData.participants.map(async (participant: any) => {
        // Get champion name from the map
        const championName = championMap[participant.championId] || `Champion ${participant.championId}`
        
        // Get summoner's rank information
        let rank = 'Unranked'
        let leaguePoints = 0
        let wins = 0
        let losses = 0
        let winRate = '0.0'
        
        try {
          // First get the summoner ID using the PUUID
          const summonerResponse = await fetch(
            `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${participant.puuid}`,
            {
              headers: {
                'X-Riot-Token': riotApiKey
              }
            }
          )
          
          if (summonerResponse.ok) {
            const summonerData = await summonerResponse.json()
            const summonerId = summonerData.id
            
            // Now get the rank using the summoner ID
            const leagueResponse = await fetch(
              `https://${region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}`,
              {
                headers: {
                  'X-Riot-Token': riotApiKey
                }
              }
            )
            
            if (leagueResponse.ok) {
              const leagueData = await leagueResponse.json()
              if (leagueData && leagueData.length > 0) {
                // Find the ranked solo queue entry
                const soloQueue = leagueData.find((entry: any) => entry.queueType === 'RANKED_SOLO_5x5')
                if (soloQueue) {
                  rank = `${soloQueue.tier} ${soloQueue.rank}`
                  leaguePoints = soloQueue.leaguePoints
                  wins = soloQueue.wins
                  losses = soloQueue.losses
                  winRate = soloQueue.wins + soloQueue.losses > 0 ? 
                    ((soloQueue.wins / (soloQueue.wins + soloQueue.losses)) * 100).toFixed(1) : '0.0'
                } else {
                  // If no solo queue, use the first available rank
                  rank = `${leagueData[0].tier} ${leagueData[0].rank}`
                  leaguePoints = leagueData[0].leaguePoints
                  wins = leagueData[0].wins
                  losses = leagueData[0].losses
                  winRate = leagueData[0].wins + leagueData[0].losses > 0 ? 
                    ((leagueData[0].wins / (leagueData[0].wins + leagueData[0].losses)) * 100).toFixed(1) : '0.0'
                }
              }
            }
          }
        } catch (error) {
          rank = 'Unranked'
        }

        // Get summoner spell information
        const spell1Info = summonerSpellMap[participant.spell1Id] || { name: 'Unknown', imageUrl: '' }
        const spell2Info = summonerSpellMap[participant.spell2Id] || { name: 'Unknown', imageUrl: '' }
        
        return {
          summonerName: participant.riotId || participant.summonerName,
          championId: participant.championId,
          championName: championName,
          teamId: participant.teamId,
          spell1Id: participant.spell1Id,
          spell2Id: participant.spell2Id,
          spell1Name: spell1Info.name,
          spell2Name: spell2Info.name,
          spell1Image: spell1Info.imageUrl,
          spell2Image: spell2Info.imageUrl,
          runes: participant.perks?.perkIds || [],
          rank: rank,
          leaguePoints: leaguePoints,
          wins: wins,
          losses: losses,
          winRate: winRate,
          level: participant.summonerLevel || 1,
          profileIconId: participant.puuid === puuid ? participant.profileIconId || 588 : participant.profileIconId || 588,
          isTargetPlayer: participant.puuid === puuid
        }
      })),
      
      // Enhanced game information
      gameInfo: {
        mapName: getMapName(gameData.mapId),
        queueName: getQueueName(gameData.queueId),
        isRanked: gameData.queueId >= 400 && gameData.queueId <= 450,
        isDraft: gameData.queueId === 400,
        isBlind: gameData.queueId === 430,
        isAram: gameData.queueId === 450,
        estimatedGameDuration: Math.floor(gameData.gameLength / 60) + ' minutes'
      }
    }

    return NextResponse.json(transformedGame)
  } catch (error) {
    console.error('Error fetching enhanced live game:', error)
    return NextResponse.json(
      { error: 'Failed to fetch enhanced live game data' },
      { status: 500 }
    )
  }
}

function getMapName(mapId: number): string {
  const mapNames: { [key: number]: string } = {
    11: 'Summoner\'s Rift',
    12: 'Howling Abyss',
    21: 'Nexus Blitz',
    22: 'TFT Arena'
  }
  return mapNames[mapId] || `Map ${mapId}`
}

function getQueueName(queueId: number): string {
  const queueNames: { [key: number]: string } = {
    400: 'Normal Draft Pick',
    420: 'Ranked Solo/Duo',
    430: 'Normal Blind Pick',
    440: 'Ranked Flex',
    450: 'ARAM',
    700: 'Clash',
    900: 'URF',
    1020: 'One for All',
    1300: 'Nexus Blitz',
    1400: 'Ultimate Spellbook',
    1700: 'Arena'
  }
  return queueNames[queueId] || `Queue ${queueId}`
}
