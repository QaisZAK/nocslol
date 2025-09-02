import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

// File-based storage for overlay configurations
const CONFIG_DIR = path.join(process.cwd(), 'data', 'overlay-configs')
const CONFIG_FILE = path.join(CONFIG_DIR, 'overlays.json')

// Load configurations from file
async function loadConfigs(): Promise<Map<string, any>> {
  try {
    const data = await fs.readFile(CONFIG_FILE, 'utf-8')
    const configs = JSON.parse(data)
    return new Map(Object.entries(configs))
  } catch (error) {
    return new Map()
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
    
    // Fetch summoner data
    const dataResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/stream-overlay/preview?summoner=${encodeURIComponent(config.summonerName)}&region=${config.region}&timeFilter=${config.timeFilter || 'all'}`)
    
    let data = null
    if (dataResponse.ok) {
      data = await dataResponse.json()
    } else {
      // Use mock data if API fails
      data = {
        summonerName: config.summonerName,
        region: config.region,
        level: 156,
        rank: 'Gold IV',
        winRate: '67%',
        totalGames: 45,
        perfectGames: 12,
        totalCS: 0,
        jungleMonsters: 0,
        wardsKilled: 23,
        monstersSlain: 0,
        lastUpdated: new Date().toISOString()
      }
    }
    
    // Generate HTML
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Stream Overlay</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        html, body {
            margin: 0;
            padding: 0;
            background: transparent;
            overflow: hidden;
            width: 100%;
            height: 100%;
            font-family: Inter, sans-serif;
        }
        
        .overlay-container {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            background: transparent;
            position: relative;
        }
        
        .overlay-content {
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            background: transparent;
            border-radius: ${config.borderRadius}px;
            border: ${config.showBorder ? `2px solid ${config.borderColor}` : 'none'};
            min-height: 80px;
            opacity: ${config.opacity};
            color: ${config.textColor};
            ${config.layout === 'horizontal' ? 'flex-direction: row; gap: 1rem;' : ''}
            ${config.layout === 'vertical' ? 'flex-direction: column; gap: 0.5rem;' : ''}
            ${config.layout === 'grid' ? 'display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem;' : ''}
            ${config.size === 'small' ? 'font-size: 0.875rem; padding: 0.75rem;' : ''}
            ${config.size === 'medium' ? 'font-size: 1rem; padding: 1rem;' : ''}
            ${config.size === 'large' ? 'font-size: 1.125rem; padding: 1.5rem;' : ''}
        }
        
        .overlay-background {
            position: absolute;
            inset: 0;
            border-radius: ${config.borderRadius}px;
            background-color: ${config.backgroundColor};
            opacity: ${config.backgroundOpacity || 0.8};
        }
        
        .overlay-stats {
            position: relative;
            z-index: 10;
            display: flex;
            align-items: center;
            ${config.layout === 'horizontal' ? 'gap: 1rem;' : ''}
            ${config.layout === 'vertical' ? 'flex-direction: column; gap: 0.5rem;' : ''}
            ${config.layout === 'grid' ? 'display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem;' : ''}
        }
        
        .stat-item {
            text-align: center;
        }
        
        .stat-value {
            font-weight: bold;
            color: ${config.accentColor};
            ${config.size === 'small' ? 'font-size: 1.25rem;' : ''}
            ${config.size === 'medium' ? 'font-size: 1.5rem;' : ''}
            ${config.size === 'large' ? 'font-size: 1.75rem;' : ''}
        }
        
        .stat-label {
            font-size: 0.75rem;
            opacity: 0.7;
        }
        
        .overlay-title {
            text-align: center;
            margin-bottom: 0.5rem;
        }
        
        .overlay-title h2 {
            font-weight: bold;
            color: ${config.accentColor};
            margin: 0;
        }
        
        .overlay-title p {
            font-size: 0.75rem;
            opacity: 0.7;
            margin: 0;
        }
        
        .perfect-games {
            text-align: center;
            margin-top: 0.5rem;
            font-size: 0.75rem;
            opacity: 0.7;
        }
        
        .perfect-games .highlight {
            font-weight: bold;
            color: ${config.accentColor};
        }
    </style>
</head>
<body>
    <div class="overlay-container">
        <div class="overlay-content">
            <div class="overlay-background"></div>
            <div class="overlay-stats">
                <div class="overlay-title">
                    <h2>${config.customTitle}</h2>
                    <p>${data.summonerName}</p>
                </div>
                
                ${config.showCS ? `
                <div class="stat-item">
                    <div class="stat-value">${data.totalCS}</div>
                    <div class="stat-label">CS</div>
                </div>
                ` : ''}
                
                ${config.showJungleMonsters ? `
                <div class="stat-item">
                    <div class="stat-value">${data.jungleMonsters}</div>
                    <div class="stat-label">Jungle</div>
                </div>
                ` : ''}
                
                ${config.showWardsKilled ? `
                <div class="stat-item">
                    <div class="stat-value">${data.wardsKilled}</div>
                    <div class="stat-label">Wards</div>
                </div>
                ` : ''}
                
                ${config.showMonstersSlain ? `
                <div class="stat-item">
                    <div class="stat-value">${data.monstersSlain}</div>
                    <div class="stat-label">Monsters</div>
                </div>
                ` : ''}
                
                ${config.showRank ? `
                <div class="stat-item">
                    <div class="stat-value">${data.rank}</div>
                    <div class="stat-label">Rank</div>
                </div>
                ` : ''}
                
                ${config.showLevel ? `
                <div class="stat-item">
                    <div class="stat-value">${data.level}</div>
                    <div class="stat-label">Level</div>
                </div>
                ` : ''}
                
                ${config.showWinRate ? `
                <div class="stat-item">
                    <div class="stat-value">${data.winRate}</div>
                    <div class="stat-label">Win Rate</div>
                </div>
                ` : ''}
                
                <div class="perfect-games">
                    Perfect Games: <span class="highlight">${data.perfectGames}</span>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        // Auto-refresh every 30 seconds
        setInterval(() => {
            location.reload();
        }, ${config.refreshInterval * 1000});
    </script>
</body>
</html>`
    
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  } catch (error) {
    console.error('Error generating overlay HTML:', error)
    return NextResponse.json({ error: 'Failed to generate overlay HTML' }, { status: 500 })
  }
}
