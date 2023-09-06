const Sequelize = require('sequelize');
const sequelize = require('./Utils/sequelize');

const User = require('./Models/User.js')(sequelize, Sequelize.DataTypes); // Import Models for the database
const Shop = require('./Models/Shop.js')(sequelize, Sequelize.DataTypes);
const Collection = require('./Models/Collection.js')(sequelize, Sequelize.DataTypes);
const Enemy = require('./Models/Enemy.js')(sequelize, Sequelize.DataTypes);

const shopData = require('./db/dbShop'); // Import the separated shop data
const characterData = require('./db/dbCharacters');
const enemyData = require('./db/dbEnemies');

// Authenticates connection to the database.
sequelize
  .authenticate()
  .then(async () => {
    console.log('Connection has been established successfully.');
  })
  .catch(console.error);

// Syncs changes to the database for all models
sequelize
  .sync({ alter: true })
  .then(async () => {
    // Sync Shop
    const shop = shopData.map((item) => {
      return Shop.upsert(item);
    });

    // Sync Character Collection
    const character = characterData.map((item) => {
      return Collection.upsert(item);
    });

    // Sync Enemies
    const enemy = enemyData.map((item) => {
      return Enemy.upsert(item);
    });

    await Promise.all([...shop, ...character, ...enemy]);
    console.log('All databases synced');
  })
  .catch(console.error)
  .finally(() => {
    sequelize.close();
  });

module.exports = { User, Shop, Collection, Enemy };

