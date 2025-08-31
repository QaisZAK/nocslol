import { NextRequest, NextResponse } from 'next/server'

interface ContactForm {
  name: string
  email: string
  subject: string
  message: string
}

export async function POST(request: NextRequest) {
  try {
    const data: ContactForm = await request.json()
    
    // Validate required fields
    if (!data.name || !data.email || !data.subject || !data.message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const webhookUrl = process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL
    if (!webhookUrl) {
      console.error('Discord webhook URL not configured')
      return NextResponse.json({ error: 'Contact system not configured' }, { status: 500 })
    }

    const embed = {
      title: '📧 New Contact Form Submission',
      color: 0x00BFFF, // Blue color for contact
      fields: [
        {
          name: '👤 Name',
          value: data.name,
          inline: true
        },
        {
          name: '📧 Email',
          value: data.email,
          inline: true
        },
        {
          name: '📝 Subject',
          value: data.subject,
          inline: false
        },
        {
          name: '💬 Message',
          value: data.message.length > 1024 ? data.message.substring(0, 1021) + '...' : data.message,
          inline: false
        }
      ],
      footer: {
        text: 'NoCSLOL Contact Form'
      },
      timestamp: new Date().toISOString()
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
      return NextResponse.json({ error: 'Failed to send contact message' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error submitting contact form:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
