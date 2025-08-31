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
    
    // Debug: Log the structure of the first match to see what we're getting
    if (validMatches.length > 0) {
      const firstMatch = validMatches[0]
      console.log('First match structure:', {
        metadata: Object.keys(firstMatch.metadata || {}),
        info: Object.keys(firstMatch.info || {}),
        participantsCount: firstMatch.info?.participants?.length || 0
      })
      
      if (firstMatch.info?.participants?.length > 0) {
        const firstParticipant = firstMatch.info.participants[0]
        console.log('First participant keys:', Object.keys(firstParticipant))
        console.log('Sample participant data:', {
          championName: firstParticipant.championName,
          kills: firstParticipant.kills,
          deaths: firstParticipant.deaths,
          assists: firstParticipant.assists,
          totalDamageDealtToChampions: firstParticipant.totalDamageDealtToChampions,
          visionScore: firstParticipant.visionScore,
          goldEarned: firstParticipant.goldEarned,
          teamPosition: firstParticipant.teamPosition,
          individualPosition: firstParticipant.individualPosition,
          role: firstParticipant.role,
          lane: firstParticipant.lane,
          champLevel: firstParticipant.champLevel,
          timePlayed: firstParticipant.timePlayed
        })
      }
    }
    
    // Filter matches for 0-9 CS and transform data with ALL available information
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
        
        // Debug: Log what we're actually getting from the API
        console.log('Participant data sample:', {
          championName: participant.championName,
          kills: participant.kills,
          deaths: participant.deaths,
          assists: participant.assists,
          totalDamageDealtToChampions: participant.totalDamageDealtToChampions,
          visionScore: participant.visionScore,
          goldEarned: participant.goldEarned,
          teamPosition: participant.teamPosition,
          individualPosition: participant.individualPosition,
          role: participant.role,
          lane: participant.lane,
          champLevel: participant.champLevel,
          timePlayed: participant.timePlayed
        })
        
        // Debug: Check for alternative property names that might exist
        console.log('Alternative property checks:', {
          'participant.totalDamageDealtToChampions exists': !!participant.totalDamageDealtToChampions,
          'participant.totalDamageDealt exists': !!participant.totalDamageDealt,
          'participant.visionScore exists': !!participant.visionScore,
          'participant.goldEarned exists': !!participant.goldEarned,
          'participant.teamPosition exists': !!participant.teamPosition,
          'participant.individualPosition exists': !!participant.individualPosition,
          'participant.champLevel exists': !!participant.champLevel,
          'participant.timePlayed exists': !!participant.timePlayed
        })
        
        // Extract ALL available data from the participant
        return {
          // Basic match info
          matchId: match.metadata.matchId,
          gameCreation: match.info.gameCreation,
          gameDuration: match.info.gameDuration,
          gameEndTimestamp: match.info.gameEndTimestamp,
          gameMode: match.info.gameMode,
          gameType: match.info.gameType,
          queueId: match.info.queueId,
          mapId: match.info.mapId,
          gameVersion: match.info.gameVersion,
          platformId: match.info.platformId,
          
          // Champion info
          championName: participant.championName || 'Unknown',
          championId: participant.championId || 0,
          championTransform: participant.championTransform || 0,
          champLevel: participant.champLevel || 0,
          champExperience: participant.champExperience || 0,
          
          // Basic stats
          cs: cs,
          totalMinionsKilled: participant.totalMinionsKilled,
          neutralMinionsKilled: participant.neutralMinionsKilled,
          win: participant.win,
          
          // Combat stats
          kills: participant.kills,
          deaths: participant.deaths,
          assists: participant.assists,
          doubleKills: participant.doubleKills,
          tripleKills: participant.tripleKills,
          quadraKills: participant.quadraKills,
          pentaKills: participant.pentaKills,
          killingSprees: participant.killingSprees,
          largestKillingSpree: participant.largestKillingSpree,
          largestMultiKill: participant.largestMultiKill,
          largestCriticalStrike: participant.largestCriticalStrike,
          
          // Damage stats
          totalDamageDealt: participant.totalDamageDealt || participant.totalDamageDealtToChampions || 0,
          totalDamageDealtToChampions: participant.totalDamageDealtToChampions || participant.totalDamageDealt || 0,
          physicalDamageDealt: participant.physicalDamageDealt || 0,
          physicalDamageDealtToChampions: participant.physicalDamageDealtToChampions || 0,
          magicDamageDealt: participant.magicDamageDealt || 0,
          magicDamageDealtToChampions: participant.magicDamageDealtToChampions || 0,
          trueDamageDealt: participant.trueDamageDealt || 0,
          trueDamageDealtToChampions: participant.trueDamageDealtToChampions || 0,
          totalDamageTaken: participant.totalDamageTaken || 0,
          physicalDamageTaken: participant.physicalDamageTaken || 0,
          magicDamageTaken: participant.magicDamageTaken || 0,
          trueDamageTaken: participant.trueDamageTaken || 0,
          damageSelfMitigated: participant.damageSelfMitigated || 0,
          
          // Gold and economy
          goldEarned: participant.goldEarned || 0,
          goldSpent: participant.goldSpent || 0,
          itemsPurchased: participant.itemsPurchased || 0,
          consumablesPurchased: participant.consumablesPurchased || 0,
          
          // Vision and objectives
          visionScore: participant.visionScore || 0,
          wardsPlaced: participant.wardsPlaced || 0,
          wardsKilled: participant.wardsKilled || 0,
          visionWardsBoughtInGame: participant.visionWardsBoughtInGame || 0,
          sightWardsBoughtInGame: participant.sightWardsBoughtInGame || 0,
          detectorWardsPlaced: participant.detectorWardsPlaced || 0,
          
          // Objectives
          dragonKills: participant.dragonKills || 0,
          baronKills: participant.baronKills || 0,
          towerKills: participant.turretKills || 0,
          inhibitorKills: participant.inhibitorKills || 0,
          nexusKills: participant.nexusKills || 0,
          objectivesStolen: participant.objectivesStolen || 0,
          objectivesStolenAssists: participant.objectivesStolenAssists || 0,
          
          // Team info
          teamId: participant.teamId || 0,
          teamPosition: participant.teamPosition || participant.individualPosition || 'Unknown',
          individualPosition: participant.individualPosition || participant.teamPosition || 'Unknown',
          role: participant.role || 'Unknown',
          lane: participant.lane || 'Unknown',
          
          // Summoner info
          summonerName: participant.summonerName,
          summonerId: participant.summonerId,
          summonerLevel: participant.summonerLevel,
          profileIcon: participant.profileIcon,
          riotIdGameName: participant.riotIdGameName,
          riotIdTagline: participant.riotIdTagline,
          
          // Summoner spells
          summoner1Id: participant.summoner1Id,
          summoner2Id: participant.summoner2Id,
          summoner1Casts: participant.summoner1Casts,
          summoner2Casts: participant.summoner2Casts,
          spell1Casts: participant.spell1Casts,
          spell2Casts: participant.spell2Casts,
          spell3Casts: participant.spell3Casts,
          spell4Casts: participant.spell4Casts,
          
          // Items (all 7 slots)
          items: [
            participant.item0,
            participant.item1,
            participant.item2,
            participant.item3,
            participant.item4,
            participant.item5,
            participant.item6
          ],
          
          // Perks and runes
          perks: participant.perks,
          
          // Challenges (advanced stats)
          challenges: participant.challenges,
          
          // Time and positioning
          timePlayed: participant.timePlayed,
          timeCCingOthers: participant.timeCCingOthers,
          totalTimeCCDealt: participant.totalTimeCCDealt,
          totalTimeSpentDead: participant.totalTimeSpentDead,
          longestTimeSpentLiving: participant.longestTimeSpentLiving,
          
          // Jungle and lane stats
          totalAllyJungleMinionsKilled: participant.totalAllyJungleMinionsKilled,
          totalEnemyJungleMinionsKilled: participant.totalEnemyJungleMinionsKilled,
          
          // Healing and shielding
          totalHeal: participant.totalHeal,
          totalHealsOnTeammates: participant.totalHealsOnTeammates,
          totalDamageShieldedOnTeammates: participant.totalDamageShieldedOnTeammates,
          totalUnitsHealed: participant.totalUnitsHealed,
          
          // First blood/tower
          firstBloodKill: participant.firstBloodKill,
          firstBloodAssist: participant.firstBloodAssist,
          firstTowerKill: participant.firstTowerKill,
          firstTowerAssist: participant.firstTowerAssist,
          
          // Pings and communication
          allInPings: participant.allInPings,
          assistMePings: participant.assistMePings,
          commandPings: participant.commandPings,
          enemyMissingPings: participant.enemyMissingPings,
          enemyVisionPings: participant.enemyVisionPings,
          getBackPings: participant.getBackPings,
          holdPings: participant.holdPings,
          needVisionPings: participant.needVisionPings,
          onMyWayPings: participant.onMyWayPings,
          pushPings: participant.pushPings,
          visionClearedPings: participant.visionClearedPings,
          
          // Game state
          bountyLevel: participant.bountyLevel,
          eligibleForProgression: participant.eligibleForProgression,
          gameEndedInEarlySurrender: participant.gameEndedInEarlySurrender,
          gameEndedInSurrender: participant.gameEndedInSurrender,
          teamEarlySurrendered: participant.teamEarlySurrendered,
          
          // Placement (for TFT/Arena)
          placement: participant.placement,
          playerAugment1: participant.playerAugment1,
          playerAugment2: participant.playerAugment2,
          playerAugment3: participant.playerAugment3,
          playerAugment4: participant.playerAugment4,
          playerSubteamId: participant.playerSubteamId,
          subteamPlacement: participant.subteamPlacement,
          
          // Player scores (for various game modes)
          playerScore0: participant.playerScore0,
          playerScore1: participant.playerScore1,
          playerScore2: participant.playerScore2,
          playerScore3: participant.playerScore3,
          playerScore4: participant.playerScore4,
          playerScore5: participant.playerScore5,
          playerScore6: participant.playerScore6,
          playerScore7: participant.playerScore7,
          playerScore8: participant.playerScore8,
          playerScore9: participant.playerScore9,
          playerScore10: participant.playerScore10,
          playerScore11: participant.playerScore11,
          
          // Missions (for special game modes)
          missions: participant.missions,
          
          // Timestamp for display
          timestamp: match.info.gameCreation
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
