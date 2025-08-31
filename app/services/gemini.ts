interface ChampionCSInfo {
  name: string
  abilities: {
    key: string
    name: string
    givesCS: boolean
    description: string
    notes: string
  }[]
  basicAttacks: {
    givesCS: boolean
    description: string
    notes: string
  }
  strategy: string
}

interface LiveGameAdviceRequest {
  playerChampion: string
  playerTeam: string[]
  enemyTeam: string[]
  championData: Record<string, ChampionCSInfo>
}

interface LiveGameAdvice {
  summary: string
  playerTips: string[]
  enemyThreats: string[]
  safeAbilities: string[]
  dangerousAbilities: string[]
  generalStrategy: string[]
}

export async function getLiveGameAdvice(request: LiveGameAdviceRequest): Promise<LiveGameAdvice> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
  
  if (!apiKey) {
    throw new Error('Gemini API key not configured')
  }

  const prompt = `You are a NoCS (No Creep Score) League of Legends expert. Analyze this live game and provide strategic advice.

GAME CONTEXT:
- Player's Champion: ${request.playerChampion}
- Player's Team: ${request.playerTeam.join(', ')}
- Enemy Team: ${request.enemyTeam.join(', ')}

CHAMPION CS MECHANICS DATA:
${Object.entries(request.championData).map(([champ, data]) => `
${champ.toUpperCase()}:
- Abilities: ${data.abilities.map(ability => `${ability.key} (${ability.name}): ${ability.givesCS ? 'GIVES CS' : 'NO CS'} - ${ability.notes}`).join(', ')}
- Basic Attacks: ${data.basicAttacks.givesCS ? 'GIVES CS' : 'NO CS'} - ${data.basicAttacks.notes}
- Strategy: ${data.strategy}
`).join('\n')}

TASK: Provide comprehensive NoCS advice for this live game. Focus on:
1. What abilities/actions to AVOID (they give CS)
2. What abilities/actions are SAFE to use
3. Specific threats from enemy champions
4. Strategic positioning and coordination tips

RESPONSE FORMAT (JSON):
{
  "summary": "Brief overview of the NoCS challenge in this game",
  "playerTips": ["3-5 specific tips for the player's champion"],
  "enemyThreats": ["3-5 specific threats from enemy champions"],
  "safeAbilities": ["List of safe abilities to use"],
  "dangerousAbilities": ["List of dangerous abilities to avoid"],
  "generalStrategy": ["3-5 general strategic tips"]
}

Make the advice specific, actionable, and focused on avoiding CS gain while maximizing impact.`

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    })

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    const responseText = data.candidates[0].content.parts[0].text
    
    // Extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Invalid response format from Gemini')
    }

    const advice: LiveGameAdvice = JSON.parse(jsonMatch[0])
    return advice
  } catch (error) {
    console.error('Error getting Gemini advice:', error)
    throw error
  }
}
