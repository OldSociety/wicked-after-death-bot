const sequelize = require('./Utils/sequelize')

const {
  User,
  MasterCharacter,
  Enemy,
  GearSets,
  GearParts,
  UserGearParts,
  Shop,
} = require('./Models/model')

const shopData = require('./db/dbShop')
const characterData = require('./db/dbMasterCharacters')
const enemyData = require('./db/dbEnemies')
const gearPartsData = require('./db/dbGearParts')
const gearSetsData = require('./db/dbGearSets')

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
    await Shop.bulkCreate(shopData, { updateOnDuplicate: ['name', 'cost'] }) // Replace field1 and field2 with the actual field names

    for (const item of characterData) {
      await MasterCharacter.findOrCreate({
        where: { master_character_id: item.master_character_id },
        defaults: item,
      })
    }

    await Enemy.bulkCreate(enemyData, {
      updateOnDuplicate: [
        'id',
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
    await GearSets.bulkCreate(gearSetsData, {
      updateOnDuplicate: ['name', 'rarity'],
    })
    await GearParts.bulkCreate(gearPartsData, {
      updateOnDuplicate: ['parts_id', 'type', 'rarity'],
    }) 

    console.log('All databases synced successfully.')
  } catch (error) {
    console.error('Error syncing databases:', error)
  }
})
