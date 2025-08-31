# Champion CS Mechanics Guide

This guide explains how to add NoCS (No Creep Score) mechanics information for each champion in the website.

## Overview

The website now includes all 148 League of Legends champions from patch 10.10.5. Each champion has a default structure that needs to be manually updated with specific CS mechanics information.

## File Location

Champion data is stored in: `public/data/champions.json`

## Champion Data Structure

Each champion has the following structure:

```json
{
  "id": "ChampionName",
  "name": "Champion Name",
  "title": "Champion Title",
  "image": "/data/champion-images/ChampionName.png",
  "tags": ["Tag1", "Tag2"],
  "partype": "Resource Type",
  "stats": { /* Champion stats */ },
  "info": { /* Difficulty info */ },
  "csMechanics": {
    "abilities": [
      {
        "key": "Q",
        "name": "Actual Ability Name",
        "givesCS": false,
        "description": "What the ability does",
        "notes": "NoCS strategy notes"
      },
      // ... W, E, R abilities
    ],
    "basicAttacks": {
      "givesCS": true,
      "description": "Basic attack CS mechanics",
      "notes": "Strategy notes"
    },
    "strategy": "Overall NoCS strategy for this champion"
  }
}
```

## How to Add CS Mechanics

### 1. Find the Champion

Open `public/data/champions.json` and locate the champion you want to update.

### 2. Update Ability Information

For each ability (Q, W, E, R):

- **key**: Keep as Q, W, E, or R
- **name**: Update with the actual ability name (e.g., "Dark Binding", "Arcane Shift")
- **givesCS**: Set to `true` if the ability can give CS, `false` if it cannot
- **description**: Brief description of what the ability does
- **notes**: Specific NoCS strategy notes

### 3. Update Basic Attacks

- **givesCS**: Usually `true` (attacking minions gives CS)
- **description**: Explain how basic attacks work with CS
- **notes**: Strategy for avoiding CS from basic attacks

### 4. Update Strategy

Provide a comprehensive NoCS strategy that covers:
- What abilities to avoid
- What abilities are safe to use
- General tips for maintaining 0 CS
- Any special considerations

## Examples

### Example 1: Jhin (Known CS Mechanics)

```json
{
  "id": "Jhin",
  "name": "Jhin",
  "title": "the Virtuoso",
  "csMechanics": {
    "abilities": [
      {
        "key": "Q",
        "name": "Dancing Grenade",
        "givesCS": false,
        "description": "Bounces between enemies, dealing damage",
        "notes": "Safe to use - does not give CS when hitting minions"
      },
      {
        "key": "W",
        "name": "Deadly Flourish",
        "givesCS": false,
        "description": "Long range root ability",
        "notes": "Safe to use - does not give CS"
      },
      {
        "key": "E",
        "name": "Captive Audience",
        "givesCS": true,
        "description": "Places flowers that explode when enemies walk over them",
        "notes": "AVOID - destroying enemy flowers gives 1 CS each"
      },
      {
        "key": "R",
        "name": "Curtain Call",
        "givesCS": false,
        "description": "Long range ultimate shots",
        "notes": "Safe to use - does not give CS"
      }
    ],
    "basicAttacks": {
      "givesCS": true,
      "description": "Basic attacks on minions give CS",
      "notes": "Avoid attacking minions to maintain 0 CS"
    },
    "strategy": "Jhin is relatively safe for NoCS play. His Q, W, and R abilities do not give CS. However, his E ability (Captive Audience) places flowers that give CS when destroyed by enemies. Avoid placing flowers near minion waves and be careful not to destroy enemy flowers. Focus on using Q, W, and R for damage and utility."
  }
}
```

### Example 2: Support Champion (Generally Safe)

```json
{
  "id": "Soraka",
  "name": "Soraka",
  "title": "the Starchild",
  "csMechanics": {
    "abilities": [
      {
        "key": "Q",
        "name": "Starcall",
        "givesCS": false,
        "description": "Deals damage and heals Soraka",
        "notes": "Safe to use - does not give CS"
      },
      {
        "key": "W",
        "name": "Astral Infusion",
        "givesCS": false,
        "description": "Heals target ally",
        "notes": "Safe to use - does not give CS"
      },
      {
        "key": "E",
        "name": "Equinox",
        "givesCS": false,
        "description": "Creates silence zone",
        "notes": "Safe to use - does not give CS"
      },
      {
        "key": "R",
        "name": "Wish",
        "givesCS": false,
        "description": "Global heal for all allies",
        "notes": "Safe to use - does not give CS"
      }
    ],
    "basicAttacks": {
      "givesCS": true,
      "description": "Basic attacks on minions give CS",
      "notes": "Avoid attacking minions to maintain 0 CS"
    },
    "strategy": "Soraka is excellent for NoCS play. All of her abilities are safe to use and do not give CS. Her Q can be used to harass enemies without worrying about CS gain. Focus on healing allies and using abilities for utility rather than damage to minions."
  }
}
```

## Common CS-Giving Actions

### Always Give CS:
- **Minion Kills**: Any ability that kills minions
- **Jungle Monster Kills**: Abilities that kill jungle monsters
- **Objective Kills**: Abilities that secure objectives (Drake, Baron, etc.)
- **Special Cases**: Some abilities have unique CS mechanics

### Usually Safe (No CS):
- **Damage Abilities**: Abilities that damage but don't kill minions
- **Utility Abilities**: Heals, shields, movement abilities
- **CC Abilities**: Stuns, slows, roots (unless they kill minions)

## Testing Your Changes

1. Update the champion data in `champions.json`
2. Refresh the website
3. Navigate to `/champions`
4. Find your champion and verify the information displays correctly
5. Check both "Play AS" and "Play AGAINST" views

## Resources for Research

- **League of Legends Wiki**: For ability names and descriptions
- **In-Game Testing**: Test abilities in practice mode
- **Community Knowledge**: Ask experienced players about CS mechanics
- **Patch Notes**: Check for recent changes to abilities

## Important Notes

- **Accuracy is Critical**: Incorrect CS mechanics information can mislead players
- **Test Everything**: Verify each ability's CS mechanics before updating
- **Keep Updated**: CS mechanics can change with patches
- **Be Specific**: Vague descriptions are not helpful for NoCS players

## Need Help?

If you're unsure about a champion's CS mechanics:
1. Test in practice mode
2. Check the League of Legends wiki
3. Ask the community
4. Leave as default until you can verify

Remember: It's better to have accurate information than to guess!
