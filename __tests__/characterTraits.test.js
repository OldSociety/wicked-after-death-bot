const {
  applyCritDamage,
} = require('../commands/Fight/helpers/characterFiles/traits')
const { traits } = require('../commands/Fight/helpers/characterFiles/traits')

describe('Character Traits', () => {
  let mockCharacter, mockCharacter2, mockCharacter3, mockEnemy
  let characters

  beforeEach(() => {
    mockCharacter = {
      id: 0,
      character_name: 'Huntsman Hyrum',
      effective_damage: 275,
      effective_health: 180,
      buffer_health: 0,
    }

    mockCharacter2 = {
      id: 1,
      character_name: 'Blackguard Clara',
      effective_damage: 225,
      effective_health: 230,
      current_health: 230,
      buffer_health: 0,
    }

    mockCharacter3 = {
      id: 2,
      character_name: 'Marksman Rennex',
      effective_damage: 215,
      effective_health: 195,
      buffer_health: 0,
    }

    mockEnemy = {
      enemy_id: 0,
      character_name: 'Goldfeather Harpy',
      effective_damage: 180,
      effective_health: 150,
      current_health: 150,
      buffer_health: 0,
    }

    characters = [mockCharacter, mockCharacter2, mockCharacter3]
  })

  const simulateCritAttack = (char) => {
    if (traits[char.character_name]) {
      traits[char.character_name].onCritReceived(char, mockEnemy)
    }
  }

  describe('Traits', () => {
    it('should apply traits correctly for all characters', () => {
      characters.forEach((char) => {
        simulateCritAttack(char)

        if (char.character_name === 'Huntsman Hyrum') {
          const expectedBuffer = Math.floor(char.effective_health * 0.1)
          expect(char.buffer_health).toBe(expectedBuffer)
        }

        if (char.character_name === 'Blackguard Clara') {
          const originalMathRandom = Math.random
          Math.random = () => 0.4 // Simulate the 50% chance
          const startingHealth = mockEnemy.current_health

          traits[char.character_name].onCritReceived(char, mockEnemy)
          expect(mockEnemy.current_health).toBeLessThan(startingHealth)

          Math.random = originalMathRandom
        }
      })
    })
  })
})
