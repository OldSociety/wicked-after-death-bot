const autoCritCharacters = new Map();

const traits = {
  'Blackguard Clara': (defender, isCrit, attacker) => {
    // When Clara is hit, set her next attack to be an auto-crit
    autoCritCharacters.set(defender.character_id, true);
  },
  'Huntsman Hyrum': (defender, isCrit) => {
    if (isCrit) {
      defender.buffer_health += Math.round(defender.effective_health * 0.2); // 20%
    }
  },
  // ... Other traits ...
};

function isNextAttackAutoCrit(characterId) {
  const result = autoCritCharacters.get(characterId) || false;
  autoCritCharacters.delete(characterId); // Reset the flag
  return result;
}

module.exports = { traits, isNextAttackAutoCrit, autoCritCharacters };
