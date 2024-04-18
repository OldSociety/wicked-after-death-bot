// enemySelection.js

const { MasterCharacter } = require('../../../Models/model') // Adjust the path as needed

async function selectEnemy() {
  try {
    const enemies = await MasterCharacter.findAll() // Retrieve all enemies
    if (!enemies.length) {
      throw new Error('No enemies available')
    }
    const randomIndex = Math.floor(Math.random() * enemies.length) // Random index
    return enemies[randomIndex] // Return a random enemy
  } catch (error) {
    console.error('Error selecting enemy:', error)
    throw error
  }
}

module.exports = { selectEnemy }
