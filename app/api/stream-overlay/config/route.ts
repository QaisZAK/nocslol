import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

// File-based storage for overlay configurations
const CONFIG_DIR = path.join(process.cwd(), 'data', 'overlay-configs')
const CONFIG_FILE = path.join(CONFIG_DIR, 'overlays.json')

// Ensure the config directory exists
async function ensureConfigDir() {
  try {
    await fs.mkdir(CONFIG_DIR, { recursive: true })
  } catch (error) {
    // Directory might already exist
  }
}

// Load configurations from file
async function loadConfigs(): Promise<Map<string, any>> {
  try {
    await ensureConfigDir()
    const data = await fs.readFile(CONFIG_FILE, 'utf-8')
    const configs = JSON.parse(data)
    return new Map(Object.entries(configs))
  } catch (error) {
    // File doesn't exist or is invalid, return empty map
    return new Map()
  }
}

// Save configurations to file
async function saveConfigs(configs: Map<string, any>) {
  try {
    await ensureConfigDir()
    const configObject = Object.fromEntries(configs)
    await fs.writeFile(CONFIG_FILE, JSON.stringify(configObject, null, 2))
  } catch (error) {
    console.error('Error saving overlay configs:', error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const config = await request.json()
    
    if (!config.id) {
      return NextResponse.json({ error: 'Overlay ID is required' }, { status: 400 })
    }
    
    // Load existing configurations
    const overlayConfigs = await loadConfigs()
    
    // Store the configuration
    overlayConfigs.set(config.id, {
      ...config,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    
    // Save to file
    await saveConfigs(overlayConfigs)
    
    return NextResponse.json({ success: true, id: config.id })
  } catch (error) {
    console.error('Error storing overlay config:', error)
    return NextResponse.json({ error: 'Failed to store overlay configuration' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Overlay ID is required' }, { status: 400 })
    }
    
    // Load configurations from file
    const overlayConfigs = await loadConfigs()
    const config = overlayConfigs.get(id)
    
    if (!config) {
      return NextResponse.json({ error: 'Overlay configuration not found' }, { status: 404 })
    }
    
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error retrieving overlay config:', error)
    return NextResponse.json({ error: 'Failed to retrieve overlay configuration' }, { status: 500 })
  }
}
