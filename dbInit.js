const Sequelize = require('sequelize')
const sequelize = require('./Utils/sequelize');

const User = require('./Models/User.js')(sequelize, Sequelize.DataTypes)
const Shop = require('./Models/Shop.js')(sequelize, Sequelize.DataTypes);
const Collection = require('./Models/Collection.js')(sequelize, Sequelize.DataTypes);
const CardList = require('./Packs/cardList')

// Authenticates connection to database.
sequelize
  .authenticate()
  .then(async () => {
    console.log('Connection has been established successfully.')
  })
  .catch(console.error)

// Syncs changes to database
sequelize
  .sync({ alter: true })
  .then(async () => {
    console.log('All databases synced')
    sequelize.close()
  })
  .catch(console.error)

  sequelize.sync({ force }).then(async () => {
    const shop = [
      Shop.upsert({ name: 'Urn Clara', cost: 0 }),
      Shop.upsert({ name: 'Aja Hyrum', cost: 0 }),
      Shop.upsert({ name: 'Daetoris', cost: 0 }),
    ];
  
    await Promise.all(shop);
    console.log('Database synced');
  
    sequelize.close();
  }).catch(console.error);

module.exports = { User, Shop, Collection }
