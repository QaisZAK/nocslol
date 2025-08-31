// Summoner spell utilities for mapping IDs to names and images

interface SummonerSpellData {
  id: string
  name: string
  description: string
  image: {
    full: string
  }
  key: string
}

interface SummonerSpellsResponse {
  data: Record<string, SummonerSpellData>
}

// Cache for summoner spells data
let summonerSpellsCache: Record<string, SummonerSpellData> | null = null

// Fetch summoner spells data from DDragon API
export async function fetchSummonerSpells(): Promise<Record<string, SummonerSpellData>> {
  if (summonerSpellsCache) {
    return summonerSpellsCache
  }

  try {
    const response = await fetch('https://ddragon.leagueoflegends.com/cdn/15.17.1/data/en_US/summoner.json')
    const data: SummonerSpellsResponse = await response.json()
    
    // Create a mapping from key (numeric ID) to spell data
    const spellsByKey: Record<string, SummonerSpellData> = {}
    
    Object.values(data.data).forEach(spell => {
      spellsByKey[spell.key] = spell
    })
    
    summonerSpellsCache = spellsByKey
    return spellsByKey
  } catch (error) {
    console.error('Failed to fetch summoner spells:', error)
    return {}
  }
}

// Get summoner spell data by numeric ID
export async function getSummonerSpellById(spellId: number): Promise<SummonerSpellData | null> {
  const spells = await fetchSummonerSpells()
  return spells[spellId.toString()] || null
}

// Get summoner spell image URL by numeric ID
export async function getSummonerSpellImageUrl(spellId: number): Promise<string | null> {
  const spell = await getSummonerSpellById(spellId)
  if (!spell) return null
  
  return `https://ddragon.leagueoflegends.com/cdn/15.17.1/img/spell/${spell.image.full}`
}

// Get summoner spell name by numeric ID
export async function getSummonerSpellName(spellId: number): Promise<string | null> {
  const spell = await getSummonerSpellById(spellId)
  return spell?.name || null
}
