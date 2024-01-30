

// Function to calculate the attack speed of a character
function calculateAttackSpeed(character) {
    let baseSpeed = character.attackType === 'light' ? 6 : 8
  
    // if (character.tags.includes('rogue')) {
    //   if (character.attackType === 'light') {
    //     baseSpeed -= 1 // Rogues attack faster
    //   }
    // }
  
    return baseSpeed
  }

  // Function to initialize character flags and counters
function initializeCharacterFlagsAndCounters(character) {
    character.sp1Counter = 0
    character.special90 = false
    character.special60 = false
    character.special30 = false
    character.special90Triggered = false
    character.special60Triggered = false
    character.special30Triggered = false
    character.activeSpecials = []
  }

  module.exports = { calculateAttackSpeed, initializeCharacterFlagsAndCounters };