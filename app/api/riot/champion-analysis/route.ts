import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const championNames = searchParams.get('champions')
  const enemyChampions = searchParams.get('enemyChampions')
  const alliedChampions = searchParams.get('alliedChampions')

  if (!championNames) {
    return NextResponse.json({ error: 'Champion names are required' }, { status: 400 })
  }

  try {
    // Read the champions database from public folder
    const championsPath = path.join(process.cwd(), 'public', 'data', 'champions.json')
    const championsData = JSON.parse(fs.readFileSync(championsPath, 'utf8'))
    
    const championList = championNames.split(',').map(name => name.trim())

    const analysis = []
    const specialCases = ['Sylas', 'Viego']

    // First pass: analyze all champions normally
    for (const championName of championList) {
      // Find champion in database (case-insensitive)
      const champion = championsData.champions.find((c: any) => 
        c.name.toLowerCase() === championName.toLowerCase()
      )

      if (champion && champion.csMechanics) {
        const dangerousAbilities = champion.csMechanics.abilities
          .filter((ability: any) => ability.givesCS)
          .map((ability: any) => ability.key)

        // Get detailed ability information
        const abilityDetails = champion.csMechanics.abilities
          .filter((ability: any) => ability.givesCS)
          .map((ability: any) => ({
            key: ability.key,
            name: ability.name,
            notes: ability.notes
          }))

        // Check if passive gives CS
        const passiveGivesCS = champion.csMechanics.passive?.givesCS || false

        analysis.push({
          name: champion.name,
          isDangerous: dangerousAbilities.length > 0 || passiveGivesCS,
          dangerousAbilities,
          abilityDetails,
          notes: champion.csMechanics.strategy,
          basicAttacksDangerous: champion.csMechanics.basicAttacks?.givesCS || false,
          passiveGivesCS,
          passiveDetails: passiveGivesCS ? {
            name: champion.csMechanics.passive.name,
            notes: champion.csMechanics.passive.notes
          } : null,
          specialCase: undefined,
          dangerousAlliedChampions: undefined
        })
      } else {
        // Fallback for champions not in database
        analysis.push({
          name: championName,
          isDangerous: false,
          dangerousAbilities: [],
          abilityDetails: [],
          notes: 'Champion not found in database. Use caution with abilities near minions.',
          basicAttacksDangerous: true,
          passiveGivesCS: false,
          passiveDetails: null,
          specialCase: undefined,
          dangerousAlliedChampions: undefined
        })
      }
    }

    // Second pass: handle special cases for Sylas and Viego
    const enemyChampionList = enemyChampions ? enemyChampions.split(',').map(name => name.trim()) : []
    const alliedChampionList = alliedChampions ? alliedChampions.split(',').map(name => name.trim()) : []
    
    const enemyAnalysis = analysis.filter(champ => 
      specialCases.includes(champ.name) && enemyChampionList.includes(champ.name)
    )

    if (enemyAnalysis.length > 0) {
      // Find dangerous allied champions (non-Sylas/Viego champions that are dangerous)
      const dangerousAlliedChampions = analysis.filter(champ => 
        !specialCases.includes(champ.name) && champ.isDangerous && alliedChampionList.includes(champ.name)
      )

      // Update Sylas and Viego analysis based on allied champions
      for (const enemyChamp of enemyAnalysis) {
        let relevantDangerousAllies: typeof dangerousAlliedChampions = []
        
        if (enemyChamp.name === 'Sylas') {
          // Sylas is only dangerous if allies have R abilities
          relevantDangerousAllies = dangerousAlliedChampions.filter(ally => 
            ally.abilityDetails.some((ability: any) => ability.key === 'R')
          )
        } else if (enemyChamp.name === 'Viego') {
          // Viego is only dangerous if allies have Q, W, or E abilities (not R)
          relevantDangerousAllies = dangerousAlliedChampions.filter(ally => 
            ally.abilityDetails.some((ability: any) => ['Q', 'W', 'E'].includes(ability.key))
          )
        }

        if (relevantDangerousAllies.length === 0) {
          // No relevant dangerous allied champions - mark as safe
          enemyChamp.isDangerous = false
          enemyChamp.dangerousAbilities = []
          enemyChamp.abilityDetails = []
          enemyChamp.passiveGivesCS = false
          enemyChamp.passiveDetails = null
          enemyChamp.notes = 'This champion is safe BECAUSE you have no allied dangerous champions.'
          ;(enemyChamp as any).specialCase = 'safe-no-allies'
        } else {
          // Has relevant dangerous allied champions - show both enemy and allied dangerous abilities
          enemyChamp.notes = `This champion is dangerous because you have allied champions with dangerous abilities. Watch out for both this champion's abilities AND your allies' abilities.`
          ;(enemyChamp as any).specialCase = 'dangerous-with-allies'
          ;(enemyChamp as any).dangerousAlliedChampions = relevantDangerousAllies.map(ally => ({
            name: ally.name,
            dangerousAbilities: ally.dangerousAbilities,
            abilityDetails: ally.abilityDetails,
            passiveGivesCS: ally.passiveGivesCS,
            passiveDetails: ally.passiveDetails
          }))
        }
      }
    }

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error('Error analyzing champions:', error)
    return NextResponse.json(
      { error: 'Failed to analyze champions' },
      { status: 500 }
    )
  }
}
