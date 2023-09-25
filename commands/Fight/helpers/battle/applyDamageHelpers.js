
function calcDamage(attacker, randHit, isCrit) {
    let minDamage = Math.round(attacker.effective_damage * 0.08)
    let maxDamage = Math.round(attacker.effective_damage * 0.12)
  
    if (randHit < attacker.crit_chance * 100) {
      isCrit = true
      minDamage *= attacker.crit_damage
      maxDamage *= attacker.crit_damage
    }
  
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
    compileDamageResult
  };
  