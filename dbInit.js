const Sequelize = require('sequelize')

const sequelize = new Sequelize('database', 'username', 'password', {
  host: 'localhost',
  dialect: 'sqlite',
  logging: false,
  storage: 'database.sqlite',
})

const Users = require('./Models/Users.js')(sequelize, Sequelize.DataTypes)

sequelize
  .authenticate()
  .then(async () => {
    console.log('Connection has been established successfully.')
  })
  .catch(console.error)

sequelize
  .sync({ alter: true })
  .then(async () => {
    console.log('All databases synced')
    sequelize.close()
  })
  .catch(console.error)

// Reflect.defineProperty(Users.prototype, 'getItems', {
//   value: () => {
//     return UserItems.findAll({
//       where: { user_id: this.user_id },
//       include: ['item'],
//     });
//   },
// });

module.exports = { Users }
