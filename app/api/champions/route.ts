import { NextRequest, NextResponse } from 'next/server'
import { writeFileSync } from 'fs'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the data structure
    if (!body.champions || !Array.isArray(body.champions)) {
      return NextResponse.json({ error: 'Invalid data structure' }, { status: 400 })
    }

    // Get the path to the champions.json file
    const filePath = join(process.cwd(), 'public', 'data', 'champions.json')
    
    // Write the updated data to the file
    writeFileSync(filePath, JSON.stringify(body, null, 2), 'utf8')
    
    return NextResponse.json({ 
      success: true, 
      message: 'Champions data updated successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error saving champions data:', error)
    return NextResponse.json({ 
      error: 'Failed to save champions data' 
    }, { status: 500 })
  }
}
