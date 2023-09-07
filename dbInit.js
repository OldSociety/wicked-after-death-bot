const Sequelize = require('sequelize');
const sequelize = require('./Utils/sequelize');
const retry = require('retry'); // Import the 'retry' library

const User = require('./Models/User.js')(sequelize, Sequelize.DataTypes);
const Shop = require('./Models/Shop.js')(sequelize, Sequelize.DataTypes);
const Collection = require('./Models/Collection.js')(sequelize, Sequelize.DataTypes);
const Enemy = require('./Models/Enemy.js')(sequelize, Sequelize.DataTypes);

const shopData = require('./db/dbShop');
const characterData = require('./db/dbCharacters');
const enemyData = require('./db/dbEnemies');

// Authenticates connection to the database.
sequelize
  .authenticate()
  .then(async () => {
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
        resolve(result); // Resolve the promise with the result
      } catch (error) {
        if (operationRetry.retry(error)) {
          // Retry the operation if it's a retryable error
          console.error(`Retry attempt #${currentAttempt} due to error: ${error.message}`);
        } else {
          // Reject the promise if max retries reached
          reject(error);
        }
      }
    });
  });

  return operationPromise;
}

// Syncs changes to the database for all models using the retry mechanism
sequelize
  .sync({ alter: true })
  .then(async () => {
    // Sync Shop
    const shop = shopData.map((item) => {
      return retryDatabaseOperation(() => Shop.upsert(item));
    });

    // Sync Character Collection with conflict resolution
    const character = characterData.map(async (item) => {
      // Use try-catch to handle any errors during upsert
      try {
        await retryDatabaseOperation(() => Collection.findCreateFind({
          where: { id: item.character_id },
          defaults: item,
          // Use SQLite-specific conflict resolution
          onDuplicate: ['id'],
        }));
      } catch (error) {
        console.error('Error syncing Collection:', error);
      }
    });

    // Sync Enemies
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
  })
  .finally(() => {
    sequelize.close();
  });

module.exports = { User, Shop, Collection, Enemy };
