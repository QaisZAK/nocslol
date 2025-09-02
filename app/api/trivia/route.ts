import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

interface Ability {
  key: string
  name: string
  givesCS: boolean
  description: string
  notes: string
  image?: string
}

interface Champion {
  id: string
  name: string
  title: string
  image: string
  csMechanics: {
    abilities: Ability[]
  }
}

interface DailyTrivia {
  champion: Champion
  ability: Ability
  date: string
}

export async function GET() {
  try {
    // Read the champions data from the public data directory
    const dataPath = path.join(process.cwd(), 'public', 'data', 'champions.json')
    const championsData = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
    
    const today = new Date().toDateString()
    const seed = new Date(today).getTime()
    
    // Get all abilities that either give CS (true) or have non-empty notes
    const eligibleAbilities: { champion: Champion; ability: Ability }[] = []
    
    championsData.champions.forEach((champion: Champion) => {
      if (champion.csMechanics && champion.csMechanics.abilities) {
        champion.csMechanics.abilities.forEach((ability: Ability) => {
          // Include abilities that give CS (true) OR have non-empty notes
          if (ability.givesCS || (ability.notes && ability.notes.trim() !== '')) {
            eligibleAbilities.push({ champion, ability })
          }
        })
      }
    })
    
    if (eligibleAbilities.length === 0) {
      return NextResponse.json(
        { error: 'No eligible abilities found' },
        { status: 404 }
      )
    }
    
    // Use seed to select consistent daily ability
    const index = seed % eligibleAbilities.length
    const selected = eligibleAbilities[index]
    
    // Add correct image URLs
    const championWithImages = {
      ...selected.champion,
      image: `https://ddragon.leagueoflegends.com/cdn/15.17.1/img/champion/${selected.champion.id}.png`
    }
    
    const abilityWithImage = {
      ...selected.ability,
      image: `https://ddragon.leagueoflegends.com/cdn/15.17.1/img/spell/${selected.champion.id}${selected.ability.key}.png`
    }
    
    const dailyTrivia: DailyTrivia = {
      champion: championWithImages,
      ability: abilityWithImage,
      date: today
    }
    
    return NextResponse.json(dailyTrivia)
  } catch (error) {
    console.error('Error generating daily trivia:', error)
    return NextResponse.json(
      { error: 'Failed to generate daily trivia' },
      { status: 500 }
    )
  }
}
