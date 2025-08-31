# Live Page - NoCSLOL

The Live page provides real-time analysis for League of Legends players participating in the No Creep Score challenge.

## Features

### 1. Live Game Analysis
When a summoner is in-game, the page will:
- Show current game information (mode, type, duration)
- Display all participants with their champions and ranks
- Analyze enemy champions based on the CS mechanics database
- Provide warnings about dangerous abilities that can give CS
- Show a summary of what to look out for

### 2. Low CS Match History
Shows previous games where the summoner had 9 or fewer CS:
- Displays match details (champion, KDA, game mode, duration)
- Shows CS count for each match
- Indicates win/loss status
- Lists items used in the game

## How to Use

### Searching for a Summoner
1. **Game Name**: Enter the summoner's game name (e.g., "Bardinette")
2. **Tagline**: Enter the tagline (e.g., "NA1", "EUW1", "KR")
3. Click "Search" to find the summoner

### Riot ID Format
Riot has transitioned from Summoner Names to Riot IDs. Use the format:
```
GameName#Tagline
```

Examples:
- `Bardinette#NA1` (North America)
- `PlayerName#EUW1` (Europe West)
- `Summoner#KR` (Korea)

### Understanding the Results

#### Live Game Tab
- **Enemy Team**: Red-bordered cards showing dangerous champions
- **Your Team**: Blue-bordered cards showing allies
- **Summary**: Yellow warning box highlighting what to watch out for

#### Match History Tab
- Shows games with ≤9 CS (0 CS being the goal)
- Displays detailed match information
- Sorted by most recent first

## Champion Analysis

The system automatically analyzes enemy champions using the CS mechanics database:
- **DANGEROUS**: Champions with abilities that can give CS
- **SAFE**: Champions that can use abilities without CS gain
- **Notes**: Specific strategy advice for each champion

## API Endpoints Used

- `/api/riot/summoner` - Find summoner by Riot ID
- `/api/riot/live-game` - Get current game data
- `/api/riot/match-history` - Get match history with CS filtering
- `/api/riot/champion-analysis` - Analyze champions for CS mechanics

## Requirements

- Valid Riot API key in environment variables
- Champions database (`data/champions.json`) with CS mechanics information
- Internet connection to access Riot APIs

## Troubleshooting

- **"Summoner not found"**: Check the Riot ID format and region
- **"No active game"**: The summoner is not currently in a game
- **"Analysis unavailable"**: Champion not found in the database
- **API errors**: Verify your Riot API key is valid and has sufficient rate limits

## Rate Limits

Be aware of Riot API rate limits:
- 100 requests per 2 minutes for development
- 20 requests per 1 second for production
- Plan accordingly when testing multiple searches
