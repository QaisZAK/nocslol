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
  nextReset: string
  timeUntilNext: number
}

interface TriviaRotation {
  lastReset: string
  usedChampions: string[]
  currentChampion: string | null
  nextReset: string
}

// Target champion names for trivia
const TARGET_CHAMPION_NAMES = [
  'Zac', 'Yorick', 'Wukong', 'Teemo', 'Shaco', 'LeBlanc', 'Jhin', 'Ivern', 'Fiddlesticks', 'Annie',
  'Zyra', 'Sion', 'Rek\'Sai', 'Neeko', 'Naafiri', 'Malzahar', 'Kalista', 'Illaoi', 'Heimerdinger', 'Gangplank', 'Elise', 'Bel\'Veth', 'Azir', 'Aphelios', 'Anivia'
]

// Function to get correct champion IDs from names
function getTriviaChampionIds(championsData: any[]): string[] {
  return TARGET_CHAMPION_NAMES.map(targetName => {
    const champion = championsData.find((champ: any) => 
      champ.name.toLowerCase().trim() === targetName.toLowerCase().trim()
    )
    return champion ? champion.id : null
  }).filter(Boolean) as string[]
}

function getNextMidnight(): Date {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  return tomorrow
}

function getTimeUntilNextReset(): number {
  const now = new Date()
  const nextReset = getNextMidnight()
  return Math.max(0, nextReset.getTime() - now.getTime())
}

function loadTriviaRotation(): TriviaRotation {
  const rotationPath = path.join(process.cwd(), 'data', 'trivia-rotation.json')
  
  try {
    if (fs.existsSync(rotationPath)) {
      const data = fs.readFileSync(rotationPath, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error loading trivia rotation:', error)
  }
  
  // Default rotation state
  return {
    lastReset: new Date().toISOString(),
    usedChampions: [],
    currentChampion: null,
    nextReset: getNextMidnight().toISOString()
  }
}

function saveTriviaRotation(rotation: TriviaRotation): void {
  const rotationPath = path.join(process.cwd(), 'data', 'trivia-rotation.json')
  
  try {
    fs.writeFileSync(rotationPath, JSON.stringify(rotation, null, 2))
  } catch (error) {
    console.error('Error saving trivia rotation:', error)
  }
}

function selectRandomChampion(usedChampions: string[], availableChampionIds: string[]): string {
  const availableChampions = availableChampionIds.filter(champ => !usedChampions.includes(champ))
  
  if (availableChampions.length === 0) {
    // All champions used, reset the list
    return availableChampionIds[Math.floor(Math.random() * availableChampionIds.length)]
  }
  
  return availableChampions[Math.floor(Math.random() * availableChampions.length)]
}

function shouldResetRotation(rotation: TriviaRotation): boolean {
  const now = new Date()
  const lastReset = new Date(rotation.lastReset)
  const nextReset = new Date(rotation.nextReset)
  
  // Reset if it's past the next reset time
  return now >= nextReset
}

export async function GET() {
  try {
    // Load champions data
    const dataPath = path.join(process.cwd(), 'public', 'data', 'champions.json')
    const championsData = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
    
    // Get correct champion IDs for trivia
    const triviaChampionIds = getTriviaChampionIds(championsData.champions)
    
    // Load current rotation state
    let rotation = loadTriviaRotation()
    
    // Check if we need to reset the rotation
    if (shouldResetRotation(rotation)) {
      // Reset the rotation
      rotation = {
        lastReset: new Date().toISOString(),
        usedChampions: [],
        currentChampion: null,
        nextReset: getNextMidnight().toISOString()
      }
    }
    
    // If no current champion is set, select one
    if (!rotation.currentChampion) {
      rotation.currentChampion = selectRandomChampion(rotation.usedChampions, triviaChampionIds)
      rotation.usedChampions.push(rotation.currentChampion)
      saveTriviaRotation(rotation)
    }
    
    // Find the selected champion in the data
    const selectedChampion = championsData.champions.find((champion: Champion) => 
      champion.id === rotation.currentChampion
    )
    
    if (!selectedChampion) {
      return NextResponse.json(
        { error: 'Selected champion not found' },
        { status: 404 }
      )
    }
    
    // Get all abilities that either give CS (true) or have non-empty notes
    const eligibleAbilities: Ability[] = []
    
    if (selectedChampion.csMechanics && selectedChampion.csMechanics.abilities) {
      selectedChampion.csMechanics.abilities.forEach((ability: Ability) => {
        // Include abilities that give CS (true) OR have non-empty notes
        if (ability.givesCS || (ability.notes && ability.notes.trim() !== '')) {
          eligibleAbilities.push(ability)
        }
      })
    }
    
    if (eligibleAbilities.length === 0) {
      return NextResponse.json(
        { error: 'No eligible abilities found for selected champion' },
        { status: 404 }
      )
    }
    
    // Select a random ability from eligible abilities
    const selectedAbility = eligibleAbilities[Math.floor(Math.random() * eligibleAbilities.length)]
    
    // Add correct image URLs
    const championWithImages = {
      ...selectedChampion,
      image: `https://ddragon.leagueoflegends.com/cdn/15.17.1/img/champion/${selectedChampion.id}.png`
    }
    
    const abilityWithImage = {
      ...selectedAbility,
      image: `https://ddragon.leagueoflegends.com/cdn/15.17.1/img/spell/${selectedChampion.id}${selectedAbility.key}.png`
    }
    
    const dailyTrivia: DailyTrivia = {
      champion: championWithImages,
      ability: abilityWithImage,
      date: new Date().toDateString(),
      nextReset: rotation.nextReset,
      timeUntilNext: getTimeUntilNextReset()
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