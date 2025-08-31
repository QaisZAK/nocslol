import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const championNames = searchParams.get('champions')

  if (!championNames) {
    return NextResponse.json({ error: 'Champion names are required' }, { status: 400 })
  }

  try {
    console.log('Champion analysis requested for:', championNames)
    
    // Read the champions database from public folder
    const championsPath = path.join(process.cwd(), 'public', 'data', 'champions.json')
    const championsData = JSON.parse(fs.readFileSync(championsPath, 'utf8'))
    
    const championList = championNames.split(',').map(name => name.trim())
    console.log('Processing champions:', championList)
    const analysis = []

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

        analysis.push({
          name: champion.name,
          isDangerous: dangerousAbilities.length > 0,
          dangerousAbilities,
          abilityDetails,
          notes: champion.csMechanics.strategy,
          basicAttacksDangerous: champion.csMechanics.basicAttacks?.givesCS || false
        })
             } else {
         // Fallback for champions not in database
         analysis.push({
           name: championName,
           isDangerous: false,
           dangerousAbilities: [],
           abilityDetails: [],
           notes: 'Champion not found in database. Use caution with abilities near minions.',
           basicAttacksDangerous: true
         })
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
