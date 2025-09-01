# Final URL Structure

## Overview
Following OP.GG's proven approach, we now support clean URLs for summoner lookups without URL fragment conflicts.

## URL Formats

### 1. Query Parameters (Flexible)
```
/live?region=euw&summoner=0 cs&tag=shen
/live?region=na1&summoner=MeatKebab&tag=HALAL
```

### 2. Dynamic Routes (OP.GG Style)
```
/live/euw/0 cs-shen
/live/na1/MeatKebab-HALAL
/live/kr/PlayerName-TAG
```

## How It Works

### OP.GG Reference
- **OP.GG URL**: `https://op.gg/lol/summoners/euw/0%20cs-Shen`
- **Our URL**: `/live/euw/0 cs-shen`

### URL Parsing
1. **Dynamic Route**: `/live/[region]/[summoner]`
2. **Parsing**: Split summoner parameter by `-` to get name and tag
3. **Redirect**: Convert to query parameters for the main live page
4. **Search**: Auto-fill and search for the summoner

### Example Flow
1. User visits: `/live/euw/0 cs-shen`
2. System parses: `region=euw`, `summoner=0 cs`, `tag=shen`
3. Redirects to: `/live?region=euw&summoner=0 cs&tag=shen`
4. Auto-searches for: `0 cs#shen`

## Benefits
- ✅ **No URL fragment conflicts** (using `-` instead of `#`)
- ✅ **Industry standard** (following OP.GG's approach)
- ✅ **Clean, readable URLs**
- ✅ **Flexible parameter support**
- ✅ **Auto-search functionality**

## Testing
- ✅ Build successful
- ✅ All routes working
- ✅ URL parsing correct
- ✅ Auto-search functional
