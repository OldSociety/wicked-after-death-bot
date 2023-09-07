const Sequelize = require('sequelize');
const sequelize = require('./Utils/sequelize');
const retry = require('retry');

const User = require('./Models/User.js')(sequelize, Sequelize.DataTypes);
const Shop = require('./Models/Shop.js')(sequelize, Sequelize.DataTypes);
const Collection = require('./Models/Collection.js')(sequelize, Sequelize.DataTypes);
const Enemy = require('./Models/Enemy.js')(sequelize, Sequelize.DataTypes);
const Character = require('./Models/Character.js')(sequelize, Sequelize.DataTypes);  

// Model connections
User.hasMany(Collection, { as: 'collections' });
Collection.belongsTo(User);

Character.hasMany(Collection);
Collection.belongsTo(Character);


const shopData = require('./db/dbShop');
const characterData = require('./db/dbCharacters');
const enemyData = require('./db/dbEnemies');

// Authenticates connection to the database.
sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(console.error);

// Define a function to retry database operations
async function retryDatabaseOperation(operation, maxRetries = 5, retryDelay = 100) {
  const operationOptions = {
    retries: maxRetries,
    factor: 2,
    minTimeout: retryDelay,
    maxTimeout: retryDelay,
  };

  const operationPromise = new Promise((resolve, reject) => {
    const operationRetry = retry.operation(operationOptions);

    operationRetry.attempt(async (currentAttempt) => {
      try {
        const result = await operation();
        resolve(result);
      } catch (error) {
        if (operationRetry.retry(error)) {
          console.error(`Retry attempt #${currentAttempt} due to error: ${error.message}`);
        } else {
          reject(error);
        }
      }
    });
  });

  return operationPromise;
}

// Sync changes and populate database
sequelize
  .sync({ alter: true })
  .then(async () => {
    const shop = shopData.map((item) => {
      return retryDatabaseOperation(() => Shop.upsert(item));
    });

    const character = characterData.map(async (item) => {
      try {
        await retryDatabaseOperation(() => Collection.findCreateFind({
          where: { id: item.character_id },
          defaults: item,
          onDuplicate: ['id'],
        }));
      } catch (error) {
        console.error('Error syncing Collection:', error);
      }
    });

    const enemy = enemyData.map((item) => {
      return retryDatabaseOperation(() => Enemy.upsert(item));
    });

    return Promise.all([...shop, ...character, ...enemy]);
  })
  .then(() => {
    console.log('All databases synced');
  })
  .catch((error) => {
    console.error('Error syncing databases:', error);
  });

  const character = characterData.map(async (item) => {
    try {
      await retryDatabaseOperation(() => Character.findCreateFind({  // Changed Collection to Character
        where: { id: item.character_id },
        defaults: item,
        onDuplicate: ['id'],
      }));
    } catch (error) {
      console.error('Error syncing Character:', error);  // Updated the error message
    }
    try {
      await retryDatabaseOperation(() => Character.findCreateFind({
        where: { character_id: item.character_id },
        defaults: item,
        onDuplicate: ['character_id'],
      }));
      console.log(`Successfully inserted character ${item.character_name}`);
    } catch (error) {
      console.error(`Error syncing Character: ${error}`);
    }
  });


  

// Add this function at the end of your file
async function fetchUserWithCollections(userId) {
  try {
    const user = await User.findOne({
      where: { user_id: userId },
      include: [{
        model: Collection,
        as: 'collections' // must match the 'as' in your association
      }],
    });
    return user;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// Make sure to export this function if you're going to use it in another file
module.exports = { User, Shop, Collection, Enemy, fetchUserWithCollections };

