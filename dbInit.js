const sequelize = require('./Utils/sequelize')

const { User, MasterCharacter, Enemy, Gear, Shop } = require('./Models/model')

const shopData = require('./db/dbShop')
const characterData = require('./db/dbMasterCharacters')
const enemyData = require('./db/dbEnemies')

// Authenticates connection to the database.
sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.')
  })
  .catch(console.error)

// Sync changes and populate database
sequelize
  .sync({ alter: true })
  .then(async () => {
    const shopPromises = shopData.map((item) => Shop.upsert(item))
    const masterCharacterPromises = characterData.map(async (item) => {
      try {
        await MasterCharacter.upsert(item)
      } catch (error) {
        console.error('Error syncing MasterCharacter:', error)
      }
    })
    const enemyPromises = enemyData.map((item) => Enemy.upsert(item))
    const gearPromises = gearData.map((item) => Gear.upsert(item))
    const userGearPromises = userGearData.map((item) => UserGear.upsert(item));

    return Promise.all([
      ...masterCharacterPromises,
      ...enemyPromises,
      ...gearPromises,
      ...shopPromises,
      ...userGearPromises
    ])
  })
  .then(() => {
    console.log('All databases synced successfully.')
  })
  .catch((error) => {
    console.error('Error syncing databases:', error)
  })

module.exports = { User, Shop, Enemy }
