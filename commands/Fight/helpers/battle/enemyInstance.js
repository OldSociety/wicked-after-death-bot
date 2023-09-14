const { Enemy } = require('../../../../Models/model') // Adjust the path as needed

class EnemyInstance {
  static async initEnemy(enemyId) {
    // Initialize enemy based on the Enemy model
    const enemy = await Enemy.findByPk(enemyId)

    // Check if the enemy exists
    if (!enemy) {
      throw new Error('Enemy not found')
    }

    // No enhancements or level-ups for enemies, so we can use base stats
    const effective_health = enemy.dataValues.base_health
    const effective_damage = enemy.dataValues.base_damage
    const chance_to_hit = enemy.dataValues.chance_to_hit
    const crit_chance = enemy.dataValues.crit_chance
    const crit_damage = enemy.dataValues.crit_damage

    return {
      id: enemy.dataValues.id,
      name: enemy.dataValues.name,
      type: enemy.dataValues.type,
      unique_skill: enemy.dataValues.unique_skill,
      effective_health,
      effective_damage,
      chance_to_hit,
      crit_chance,
      crit_damage,
    }
  }

  static async updateHealth(enemyInstance, change) {
    // Update the health in the enemyInstance
    enemyInstance.effective_health += change
  }

  // Add more methods related to individual enemies
}

module.exports = EnemyInstance
