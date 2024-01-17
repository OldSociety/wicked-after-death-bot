const sequelize = require('./Utils/sequelize')

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
} = require('./Models/model')

const storeData = require('./db/dbStore')
const characterData = require('./db/dbMasterCharacters')
const enemyData = require('./db/dbEnemies')
const gearPartsData = require('./db/dbGearParts')
const gearSetsData = require('./db/dbGearSets')
const levelData = require('./db/dbBattles/dbLevels')
const raidData = require('./db/dbBattles/dbRaids')
const fightData = require('./db/dbBattles/dbFights')

// Authenticates connection to the database.
sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.')
  })
  .catch(console.error)

// Sync changes and populate database
sequelize.sync({ force: true }).then(async () => {
  try {
    await Store.bulkCreate(storeData, { updateOnDuplicate: ['name', 'cost'] })

    for (const item of characterData) {
      await MasterCharacter.findOrCreate({
        where: { master_character_id: item.master_character_id },
        defaults: item,
      })
    }

    await Enemy.bulkCreate(enemyData, {
      updateOnDuplicate: [
        'enemy_id',
        'name',
        'description',
        'type',
        'unique_skill',
        'base_damage',
        'base_health',
        'chance_to_hit',
        'crit_chance',
        'crit_damage',
      ],
    })

    // GEAR MODELS
    await GearSets.bulkCreate(gearSetsData, {
      updateOnDuplicate: ['name', 'rarity'],
    })

    await GearParts.bulkCreate(gearPartsData, {
      updateOnDuplicate: ['parts_id', 'type', 'rarity'],
    })

    // LEVEL MODELS
    // Populate StandardLevel
    for (const level of levelData) {
      await StandardLevel.findOrCreate({
        where: { level_id: level.level_id },
        defaults: level,
      })
    }

    // Populate StandardRaid
    for (const raid of raidData) {
      const level = await StandardLevel.findOne({
        where: { level_id: raid.level_id },
      })

      if (level) {
        await StandardRaid.findOrCreate({
          where: { raid_id: raid.raid_id },
          defaults: {
            level_id: raid.level_id,
            fight_number: raid.fight_number,
          },
        })
      }
    }

    // Populate StandardFight
for (const fight of fightData) {
  await StandardFight.findOrCreate({
    where: { fight_id: fight.fight_id },
    defaults: {
      raid_id: fight.raid_id,
      enemy_id: fight.enemy_id,
    },
  });
}

    console.log('All databases synced successfully.')
  } catch (error) {
    console.error('Error syncing databases:', error)
  }
})
