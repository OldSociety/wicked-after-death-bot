const {
  traits,
  isNextAttackAutoCrit,
  autoCritCharacters,
} = require('../characterFiles/traits')

// calcDamage function
function calcDamage(attacker, randHit) {
    let isCrit = false;
  
    // First, check if the character has an auto-crit flag set.
    if (autoCritCharacters.has(attacker.character_id)) {
      isCrit = isNextAttackAutoCrit(attacker.character_id); // Check and reset the flag
    } else if (randHit < attacker.crit_chance * 100) { // Then proceed to random crit chance
      isCrit = true;
    }
  
  let minDamage = Math.round(attacker.effective_damage * 0.08)
  let maxDamage = Math.round(attacker.effective_damage * 0.12)

  // console.log('normal damage min', attacker.character_name, minDamage)
  // console.log('normal damage max', attacker.character_name, maxDamage)

  // Modify damage based on critical hit
  if (isCrit) {
    // console.log('Before crit modification:', minDamage, maxDamage)
    minDamage = maxDamage // Min critical damage is set to max normal damage
    maxDamage = Math.round(maxDamage * attacker.crit_damage)
    // console.log('After crit modification:', minDamage, maxDamage)
    // console.log('attacker.crit_damage:', attacker.crit_damage)
  }

  if (autoCritCharacters.has(attacker.character_id)) {
    isCrit = isNextAttackAutoCrit(attacker.character_id) // Check and reset the flag
  }

  // console.log('crit damage min', attacker.character_name, minDamage)
  // console.log('crit damage max', attacker.character_name, maxDamage)

  return [minDamage, maxDamage, isCrit]
}

function calcActualDamage(minDamage, maxDamage) {
  return Math.floor(Math.random() * (maxDamage - minDamage + 1) + minDamage)
}

function updateBufferHealth(defender, bufferDamage) {
  if (defender.buffer_health > 0) {
    defender.buffer_health = Math.max(0, defender.buffer_health - bufferDamage)
  }
}

function updateHealth(defender, damageTaken) {
  defender.current_health = Math.max(0, defender.current_health - damageTaken)
}

function compileDamageResult(
  attacker,
  defender,
  actualDamage,
  bufferDamage,
  isCrit,
  didMiss
) {
  return {
    attacker,
    defender,
    actualDamage,
    bufferDamage,
    isCrit,
    didMiss,
  }
}

module.exports = {
  calcDamage,
  calcActualDamage,
  updateBufferHealth,
  updateHealth,
  compileDamageResult,
}
