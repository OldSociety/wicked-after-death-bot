const {
  applyDamage,
} = require('../commands/Fight/helpers/battle/battleLogic')

describe('Battle Outcomes', () => {
  const characters = [
    {
      id: 0,
      character_name: 'Huntsman Hyrum',
      effective_damage: 275,
      effective_health: 180,
      chance_to_hit: 0.8,
      crit_chance: 0,
      buffer_health: 0,
    },
    {
      id: 1,
      character_name: 'Blackguard Clara',
      effective_damage: 225,
      effective_health: 230,
      chance_to_hit: 0.8,
      crit_chance: 0,
      crit_damage: 2,
      buffer_health: 0,
    },
    {
      id: 2,
      character_name: 'Marksman Rennex',
      effective_damage: 215,
      effective_health: 195,
      chance_to_hit: 0.87,
      crit_chance: 0,
      crit_damage: 1.5,
      buffer_health: 0,
    },
  ]
  const enemies = [
    (enemy = {
      enemy_id: 0,
      character_name: 'Goldfeather Harpy',
      effective_damage: 180,
      effective_health: 150,
      chance_to_hit: 0.75,
      crit_chance: 0.1,
      crit_damage: 1.5,
      buffer_health: 0,
    }),
  ]
  test('Character should beat harpy at least 80% of the battles against enemy', () => {
    for (const character of characters) {
      for (const enemy of enemies) {
        let wins = 0
        let loss = 0
        const totalBattles = 10

        for (let i = 0; i < totalBattles; i++) {
          // Reset health for each iteration
          console.log('Battle Number: ', i)
          character.current_health = character.effective_health
          enemy.current_health = enemy.effective_health

          while (character.current_health > 0 && enemy.current_health > 0) {
            applyDamage(character, enemy)
            applyDamage(enemy, character)

            if (enemy.current_health <= 0) {
              console.log(`${character.character_name} Wins`)
              wins++
              console.log('current wins', wins)
            }
            if (character.current_health <= 0) {
              console.log('Harpy wins.')
              loss++
              console.log('current losses', loss)
            }
          }
        }

        const winRate = (wins / totalBattles) * 100
        expect(winRate).toBeGreaterThanOrEqual(80)
      }
    }
  })
})
