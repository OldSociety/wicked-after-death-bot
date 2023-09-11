const { DataTypes } = require('sequelize')
const sequelize = require('../Utils/sequelize')

// Character Models
const Character = require('./Character/Character')(sequelize, DataTypes)
const MasterCharacter = require('./Character/MasterCharacter')(
  sequelize,
  DataTypes
)

// Enemy Models
const Enemy = require('./Enemy/Enemy')(sequelize, DataTypes)

// Shop Models
const Shop = require('./Shop/Shop')(sequelize, DataTypes)

// Scavenge Models
const Gear = require('./Scavenge/Gear')(sequelize, DataTypes)

// User Models
const User = require('./User/User')(sequelize, DataTypes)
const UserGear = require('./User/UserGear')(sequelize, DataTypes)

console.log('Setting up associations')

// Model connections
User.hasMany(Character, {
  foreignKey: 'user_id',
  as: 'characters',
})

Character.belongsTo(User, {
  foreignKey: 'user_id',
})

// Character associations
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

// Gear associations

User.hasMany(UserGear, { foreignKey: 'user_id' })
Gear.hasMany(UserGear, { foreignKey: 'gear_id' })

UserGear.belongsTo(User, { foreignKey: 'user_id' })
UserGear.belongsTo(Gear, { foreignKey: 'gear_id' })

console.log('Finished setting up associations')

module.exports = {
  User,
  Character,
  MasterCharacter,
  Enemy,
  Shop,
}
