const { DataTypes } = require('sequelize')
const sequelize = require('../Utils/sequelize')

const User = require('./User/User')(sequelize, DataTypes)
const Character = require('./Character/Character')(sequelize, DataTypes)
const MasterCharacter = require('./Character/MasterCharacter')(sequelize, DataTypes)
const Enemy = require('./Enemies/Enemy')(sequelize, DataTypes)
const Shop = require('./Shop/Shop')(sequelize, DataTypes)

console.log('Setting up associations')

// Model connections
User.hasMany(Character, {
  foreignKey: 'user_id',
  as: 'characters',
})

Character.belongsTo(User, {
  foreignKey: 'user_id',
})

// Check associations
console.log('User Associations:', Object.keys(User.associations))
console.log('Character Associations:', Object.keys(Character.associations))

Character.belongsTo(MasterCharacter, {
  foreignKey: 'master_character_id',
  as: 'masterCharacter',
})

MasterCharacter.hasMany(Character, {
  foreignKey: 'master_character_id',
  as: 'instances',
})

console.log('Finished setting up associations')

module.exports = {
  User,
  Character,
  MasterCharacter,
  Enemy,
  Shop
}
