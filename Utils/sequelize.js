const { Sequelize } = require('sequelize');

// Create a Sequelize instance with your configuration
const sequelize = new Sequelize('database', 'username', 'password', {
  host: 'localhost',
  dialect: 'sqlite',
  logging: console.log,
  storage: 'database.sqlite',
});

module.exports = sequelize;
