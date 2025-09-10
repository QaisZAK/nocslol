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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: championId } = await params
    
    // Read the champions data from the public data directory
    const dataPath = path.join(process.cwd(), 'public', 'data', 'champions.json')
    const championsData = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
    
    // Find the champion by ID
    const champion = championsData.champions.find((champ: Champion) => 
      champ.id === championId
    )
    
    if (!champion) {
      return NextResponse.json(
        { error: 'Champion not found' },
        { status: 404 }
      )
    }
    
    // Add correct image URL
    const championWithImages = {
      ...champion,
      image: `https://ddragon.leagueoflegends.com/cdn/15.17.1/img/champion/${champion.id}.png`
    }
    
    return NextResponse.json(championWithImages)
  } catch (error) {
    console.error('Error fetching champion:', error)
    return NextResponse.json(
      { error: 'Failed to fetch champion' },
      { status: 500 }
    )
  }
}
