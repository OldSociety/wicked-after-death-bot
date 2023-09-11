const { Enemy } = require('../../../Models/model.js')

const selectEnemy = async () => {
  const enemies = await Enemy.findAll()
  console.log(enemies)

  // Retrieve all available enemies
  if (!enemies.length) {
    throw new Error('No enemies available for selection.')
  }

  const randomIndex = Math.floor(Math.random() * enemies.length) // Pick a random enemy
  return enemies[randomIndex]
}

module.exports = {
  selectEnemy,
}
