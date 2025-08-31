import { NextRequest, NextResponse } from 'next/server'

interface SubmissionForm {
  championName: string
  abilityName: string
  givesCS: boolean
  description: string
  proof: string
  proofType: 'text' | 'link' | 'file'
  additionalNotes: string
  submitterName: string
  submitterDiscord: string
}

export async function POST(request: NextRequest) {
  try {
    const data: SubmissionForm = await request.json()
    
    // Validate required fields
    if (!data.championName || !data.abilityName || !data.description || !data.proof || !data.submitterName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const webhookUrl = process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL
    if (!webhookUrl) {
      console.error('Discord webhook URL not configured')
      return NextResponse.json({ error: 'Discord webhook not configured' }, { status: 500 })
    }

    const embed = {
      title: '🆕 New NoCS Information Submission',
      color: data.givesCS ? 0xFF0000 : 0x00FF00, // Red for gives CS, Green for no CS
      fields: [
        {
          name: '🏆 Champion',
          value: data.championName,
          inline: true
        },
        {
          name: '⚡ Ability',
          value: data.abilityName,
          inline: true
        },
        {
          name: '📊 Gives CS?',
          value: data.givesCS ? '❌ YES' : '✅ NO',
          inline: true
        },
        {
          name: '📝 Description',
          value: data.description,
          inline: false
        },
        {
          name: '🔍 Proof Type',
          value: data.proofType.charAt(0).toUpperCase() + data.proofType.slice(1),
          inline: true
        },
        {
          name: '📋 Proof',
          value: data.proof,
          inline: false
        }
      ],
      footer: {
        text: `Submitted by ${data.submitterName}${data.submitterDiscord ? ` (Discord: ${data.submitterDiscord})` : ''}`
      },
      timestamp: new Date().toISOString()
    }

    // Add additional notes if provided
    if (data.additionalNotes.trim()) {
      embed.fields.push({
        name: '💭 Additional Notes',
        value: data.additionalNotes,
        inline: false
      })
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        embeds: [embed]
      })
    })

    if (!response.ok) {
      console.error('Discord webhook failed:', response.status, response.statusText)
      return NextResponse.json({ error: 'Failed to send to Discord' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error submitting to Discord:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
