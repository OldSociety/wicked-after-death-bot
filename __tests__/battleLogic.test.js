const {
  applyDamage,
  applyCritDamage,
} = require('../commands/Fight/helpers/battle/battleLogic')
const { traits } = require('../commands/Fight/helpers/characterFiles/traits')

describe('Character Traits', () => {
  let mockCharacter
  let mockEnemy
  beforeEach(() => {
    mockCharacter = {
      id: 0,
      character_name: 'Huntsman Hyrum',
      effective_damage: 275,
      effective_health: 180,
      chance_to_hit: 0.8,
      crit_chance: 0,
      buffer_health: 0,
    }

    mockCharacter2 = {
      id: 1,
      character_name: 'Blackguard Clara',
      effective_damage: 225,
      effective_health: 230,
      chance_to_hit: 0.8,
      crit_chance: 0,
      crit_damage: 2,
      buffer_health: 0,
    }

    mockCharacter3 = {
      id: 2,
      character_name: 'Marksman Rennex',
      effective_damage: 215,
      effective_health: 195,
      chance_to_hit: 0.87,
      crit_chance: 0,
      crit_damage: 1.5,
      buffer_health: 0,
    }

    mockEnemy = {
      enemy_id: 0,
      character_name: 'Goldfeather Harpy',
      effective_damage: 180,
      effective_health: 150,
      chance_to_hit: 0.75,
      crit_chance: 0.1,
      crit_damage: 1.5,
      buffer_health: 0,
    }
  })

  describe('Leveling Up', () => {
    test('Character stats should be whole numbers upon leveling up', () => {
      const levelUp = (char) => {
        char.level += 1
        char.effective_damage = Math.round(char.effective_damage * 1.5)
        char.effective_health = Math.round(char.effective_health * 1.5)
        return char
      }

      for (let i = 2; i <= 30; i++) {
        mockCharacter = levelUp(mockCharacter)
        expect(Number.isInteger(mockCharacter.effective_damage)).toBe(true)
        expect(Number.isInteger(mockCharacter.effective_health)).toBe(true)
      }
    })
  })

  describe('Traits', () => {
    it('should apply Huntsman Hyrum trait correctly', () => {
      traits['Huntsman Hyrum'].onCritReceived(mockCharacter)
      const expectedBuffer = Math.floor(mockCharacter.effective_health * 0.1)
      expect(mockCharacter.buffer_health).toBe(expectedBuffer)
      console.log('buffer should be:', expectedBuffer)
    })

    // if (mockCharacter.character_name === 'Blackguard Clara') {
    //   it('should apply Blackguard Clara trait correctly', () => {
    //     const originalMathRandom = Math.random
    //     Math.random = () => 0.4

    //     const startingHealth = mockCharacter.current_health

    //     traits['Blackguard Clara'].onCritReceived(mockEnemy, mockCharacter)

    //     expect(mockCHaracter.current_health).toBeLessThan(startingHealth)

    //     Math.random = originalMathRandom
    //   })
    // }
  })
})
