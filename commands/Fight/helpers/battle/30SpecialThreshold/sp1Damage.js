//THIS IS INCORRECT - this permanently changes the effective damage (reducing it by 20 percent each time)
function sp1Damage(character) {
    return character.effective_damage * 0.2;

  }
  
  module.exports = { sp1Damage }