async function initiateBattle(characterId, enemyId) {
    // Fetch the actual character and enemy from the database
    const characterData = await Character.findByPk(characterId);
    const enemyData = await Enemy.findByPk(enemyId);
  
    // Create in-memory copies
    const characterInstance = {
      ...characterData.get(),
      currentHealth: characterData.effective_health,
      currentDamage: characterData.effective_damage,
    };
  
    const enemyInstance = {
      ...enemyData.get(),
      currentHealth: enemyData.base_health,
      currentDamage: enemyData.base_damage,
    };
  
    // Initialize action queues if needed
    characterInstance.actionQueue = [];
    enemyInstance.actionQueue = [];
  
    return { characterInstance, enemyInstance };
  }
  
  
module.exports = { initiateBattle }