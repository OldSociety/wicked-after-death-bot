const Sequelize = require('sequelize')
const sequelize = require('./Utils/sequelize');

const User = require('./Models/User.js')(sequelize, Sequelize.DataTypes)
//verify Users
console.log(User === sequelize.models.User)

sequelize
  .authenticate()
  .then(async () => {
    console.log('Connection has been established successfully.')
  })
  .catch(console.error)

  // sequelize
  // .drop()
  // .then(async () => {
  //   console.log('Tables have been dropped.')
  // })
  // .catch(console.error)

sequelize
  .sync({ force: true })
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

module.exports = { User }
