const {
  User,
  MasterCharacter,
  Enemy,
  GearSets,
  GearParts,
  UserGearParts,
  Store,
  StandardFight,
  StandardLevel,
  StandardRaid,
} = require('../Models/model');

const storeData = require('../db/dbStore');
const characterData = require('../db/dbMasterCharacters');
const enemyData = require('../db/dbEnemies');
const gearPartsData = require('../db/dbGearParts');
const gearSetsData = require('../db/dbGearSets');
const levelData = require('../db/dbBattles/dbLevels');
const raidData = require('../db/dbBattles/dbRaids');
const fightData = require('../db/dbBattles/dbFights');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      console.log('Seeding data...');

      await queryInterface.bulkInsert('Stores', storeData);
      await seedMasterCharacters(characterData);
      await queryInterface.bulkInsert('Enemies', enemyData);
      await queryInterface.bulkInsert('GearParts', gearPartsData);
      await queryInterface.bulkInsert('GearSets', gearSetsData);

      await seedStandardLevels(levelData);
      await seedStandardRaids(raidData);
      await seedStandardFights(fightData);

      console.log('All data seeded successfully.');
    } catch (error) {
      console.error('Error seeding data:', error);
    }
  },
  down: async (queryInterface, Sequelize) => {
    // Revert seed here if necessary.
    await queryInterface.bulkDelete('StandardFights', null, {});
    await queryInterface.bulkDelete('StandardRaids', null, {});
    await queryInterface.bulkDelete('StandardLevels', null, {});
    await queryInterface.bulkDelete('GearSets', null, {});
    await queryInterface.bulkDelete('GearParts', null, {});
    await queryInterface.bulkDelete('Enemies', null, {});
    await queryInterface.bulkDelete('Store', null, {});
    console.log('Data seeding reverted.');
  },
};

async function seedMasterCharacters(data) {
  for (const item of data) {
    await MasterCharacter.findOrCreate({
      where: { master_character_id: item.master_character_id },
      defaults: item,
    });
  }
}

async function seedStandardLevels(data) {
  for (const level of data) {
    await StandardLevel.findOrCreate({
      where: { level_id: level.level_id },
      defaults: level,
    });
  }
}

async function seedStandardRaids(data) {
  for (const raid of data) {
    const level = await StandardLevel.findOne({
      where: { level_id: raid.level_id },
    });

    if (level) {
      await StandardRaid.findOrCreate({
        where: { raid_id: raid.raid_id },
        defaults: raid,
      });
    }
  }
}

async function seedStandardFights(data) {
  for (const fight of data) {
    const raid = await StandardRaid.findOne({
      where: { raid_id: fight.raid_id },
    });

    if (raid) {
      await StandardFight.findOrCreate({
        where: { fight_id: fight.fight_id },
        defaults: fight,
      });
    }
  }
}
