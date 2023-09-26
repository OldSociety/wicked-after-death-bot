const { sp1Damage } = require('./30SpecialThreshold/sp1Damage')

async function executeSpecial(character, activeSpecial) {
  if (activeSpecial.id === 'sp1' && character.sp1Counter > 0) {
    // character.effective_damage = sp1Damage(character)
    // character.sp1Counter-- // decrement the counter
    console.log('execute sp1 here')
  }
}

async function checkSpecialTrigger(character) {
  const healthPercent =
    (character.current_health / character.effective_health) * 100

  if (healthPercent <= 70 && !character.special70Triggered) {
    character.special70 = true
    character.special70Triggered = true
    character.sp1Counter++
  }
  if (healthPercent <= 40 && !character.special40Triggered) {
    character.special40 = true
    character.special40Triggered = true
    character.sp1Counter++
  }
  if (healthPercent <= 10 && !character.special10Triggered) {
    character.special10 = true
    character.special10Triggered = true
    character.sp1Counter++
  }

  if (character.sp1Counter > 0 && !character.activeSpecials.includes('sp1')) {
    character.activeSpecials.push('sp1')
  }

  // Consolidated logs
  if (character.sp1Counter !== character.prevSp1Counter) {
    console.log(`number of special 1 available: ${character.sp1Counter}`)
    console.log(`current health ${character.current_health}`)
    console.log(`effective health ${character.effective_health}`)
    console.log(healthPercent)
    character.prevSp1Counter = character.sp1Counter
  }
}

module.exports = { checkSpecialTrigger, executeSpecial }
