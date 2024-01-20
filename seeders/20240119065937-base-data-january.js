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

      // await queryInterface.bulkInsert('Stores', storeData, { updateOnDuplicate: ['name', 'cost'] });
      await seedMasterCharacters(characterData);
      // await queryInterface.bulkInsert('Enemies', enemyData, {
      //   updateOnDuplicate: [
      //     'enemy_id',
      //     'name',
      //     'description',
      //     'type',
      //     'unique_skill',
      //     'base_damage',
      //     'base_health',
      //     'chance_to_hit',
      //     'crit_chance',
      //     'crit_damage',
      //   ],
      // });

// await queryInterface.bulkInsert('GearSets', gearSetsData);

      try {
        console.log('Seeding GearParts data:', gearPartsData);
        
        await queryInterface.bulkInsert('GearParts', gearPartsData);
        // rest of your seeding logic
      } catch (error) {
        console.error('Error seeding GearParts data:', error);
      }      
      await seedStandardLevels(levelData);
      await seedStandardRaids(raidData);
      await seedStandardFights(fightData);

      console.log('All data seeded successfully.');
    } catch (error) {
      console.error('Error seeding data:', error);
    }
  },
  down: async (queryInterface, Sequelize) => {
    // Add code to revert seed here if necessary.
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
        defaults: {
          level_id: raid.level_id,
          fight_number: raid.fight_number,
        },
      });
    }
  }
}

async function seedStandardFights(data) {
  for (const fight of data) {
    await StandardFight.findOrCreate({
      where: { fight_id: fight.fight_id },
      defaults: {
        raid_id: fight.raid_id,
        enemy_id: fight.enemy_id,
      },
    });
  }
}
