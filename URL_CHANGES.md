# URL Changes Documentation

## Overview
The website URLs have been cleaned up to be more user-friendly and concise.

## Changes Made

### 1. Page URL Updates
- `/cs-mechanics` → `/guide`
- `/submit-info` → `/submit` 
- `/live-game` → `/live`

### 2. Live Page URL Parameter Support
The live page now supports direct summoner lookup via URL parameters:

#### Format
```
/live?region=REGION&summoner=SUMMONER_NAME&tag=TAG
```

#### Examples
- `/live?region=euw&summoner=0 cs&tag=shen`
- `/live?region=na1&summoner=MeatKebab&tag=HALAL`
- `/live?region=kr&summoner=PlayerName&tag=TAG`

#### Dynamic Route Support
For even cleaner URLs, you can also use:
```
/live/[region]/[summoner]
```

#### Examples
- `/live/euw/0 cs-shen` (OP.GG style with hyphen separator)
- `/live/na1/MeatKebab-HALAL` (OP.GG style with hyphen separator)
- `/live/kr/PlayerName-TAG` (OP.GG style with hyphen separator)

### 3. Implementation Details

#### Navigation Updates
- Updated `app/components/Navigation.tsx` to use new URLs
- All navigation links now point to the new clean URLs

#### Page Structure
- Moved `app/cs-mechanics/page.tsx` → `app/guide/page.tsx`
- Moved `app/submit-info/page.tsx` → `app/submit/page.tsx`
- Moved `app/live-game/page.tsx` → `app/live/page.tsx`

#### Live Page Enhancements
- Added URL parameter support for direct summoner search
- Created dynamic route handler at `app/live/[region]/[summoner]/page.tsx`
- Added Suspense boundary for proper Next.js 15 compatibility
- Auto-fills search input and triggers search when URL parameters are present
- **Fixed URL fragment issue**: Using OP.GG-style hyphen separator instead of hash to avoid URL fragment conflicts
- **Fixed URL encoding issue**: Properly decode URL-encoded characters (spaces, special characters) in summoner names

#### Homepage Updates
- Updated all internal links on the homepage to use new URLs
- Maintained all existing functionality while using cleaner URLs

### 4. URL Fragment Issue Resolution

The `#` character in URLs is treated as a fragment identifier by browsers, which means it's not sent to the server as part of the query parameters. This caused issues with summoner names containing `#` characters.

**Solution**: Following OP.GG's approach, using hyphen (`-`) instead of hash (`#`) in dynamic routes:
- **OP.GG format**: `/lol/summoners/euw/0%20cs-Shen`
- **Our format**: `/live/euw/0 cs-shen`

This approach:
- Avoids URL fragment conflicts entirely
- Maintains clean, readable URLs
- Follows industry standard (OP.GG)
- Still supports query parameters for flexibility

### URL Encoding Fix
URLs with spaces and special characters get encoded (e.g., "0 cs" becomes "0%20cs"). The system now properly decodes these parameters:
- **Dynamic route**: `/live/euw/0%20cs-shen` → `summonerName: "0 cs"`, `tag: "shen"`
- **Query parameters**: `/live?summoner=0%20cs&tag=shen` → `summonerName: "0 cs"`, `tag: "shen"`
- **Final search**: `0 cs#shen`

### 5. Backward Compatibility
- Old URLs will result in 404 errors (as intended for clean URL structure)
- All functionality remains the same, only the URLs have changed
- API endpoints remain unchanged

### 6. Testing
- All pages build successfully
- Navigation works correctly
- Live page URL parameter functionality works as expected
- Dynamic routes properly redirect to main live page with parameters
- URL fragment issue resolved - summoner names with `#` characters work correctly
- URL encoding issue resolved - spaces and special characters in summoner names work correctly

## Benefits
1. **Cleaner URLs**: More professional and easier to remember
2. **Better UX**: Users can bookmark specific summoner searches
3. **SEO Friendly**: Shorter, more descriptive URLs
4. **Consistent Structure**: All URLs follow a simple, logical pattern
