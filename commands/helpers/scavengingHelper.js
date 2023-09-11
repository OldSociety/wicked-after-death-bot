const cron = require('node-cron')
const { GearParts, UserGearParts } = require('./Models/model'); // Adjust the import according to your project structure

function pickRarity() {
  const rand = Math.random() * 100;
  if (rand < 60) return 'common';
  if (rand < 90) return 'uncommon';
  return 'rare';
}

async function scavengeGearParts(userId) {
  if (Math.random() < 0.05) { // 5% chance
    const rarity = pickRarity();
    const allParts = await GearParts.findAll({ where: { rarity } });
    const randomPart = allParts[Math.floor(Math.random() * allParts.length)];
    
    await UserGearParts.create({
      user_id: userId,
      parts_id: randomPart.parts_id,
      // other fields you may need to fill
    });
  }
}

module.exports.startScavengingForUser = function (userId) {
  cron.schedule('0 * * * *', async () => {
    const users = await User.findAll() 

    for (const user of users) {
      scavengeForGear(user.id) // your scavenging function
    }
  })
}
