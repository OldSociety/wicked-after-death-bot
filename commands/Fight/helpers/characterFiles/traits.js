const traits = {};

traits['Huntsman Hyrum'] = (defender, isCrit) => {
  if (isCrit) {
    defender.buffer_health += 50; // Or whatever amount you want
  }
};

traits['Blackguard Clara'] = (defender, isCrit, attacker) => {
    if (isCrit) {
      attacker.dynamicTraits = attacker.dynamicTraits || {}; // Initialize if it doesn't exist
      attacker.dynamicTraits.next_attack_is_crit = true;
    }
  };
  

// traits['Marksman Rennex'] = (defender, _, attacker) => {
//   attacker.special_attack_charge += 1.05; // Assumes special_attack_charge is a property on the attacker object
// };

module.exports = { traits }
