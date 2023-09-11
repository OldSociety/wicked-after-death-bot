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
const CharacterPack = require('./Shop/CharacterPack')(sequelize, DataTypes)

// Scavenge Models
const GearSets = require('./Scavenge/GearSets')(sequelize, DataTypes)
const GearParts = require('./Scavenge/GearParts')(sequelize, DataTypes)
const UserGearParts = require('./Scavenge/UserGearParts')(sequelize, DataTypes);

// User Models
const User = require('./User/User')(sequelize, DataTypes)
const UserGear = require('./Scavenge/UserGear')(sequelize, DataTypes)

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
GearSets.hasMany(UserGear, { foreignKey: 'gear_id' })

UserGear.belongsTo(User, { foreignKey: 'user_id' })
GearSets.belongsTo(GearSets, { foreignKey: 'gear_id' })

UserGearParts.belongsTo(User, { foreignKey: 'user_id' });
UserGearParts.belongsTo(GearParts, { foreignKey: 'parts_id' });

console.log('Finished setting up associations')

module.exports = {
  Character,
  MasterCharacter,
  Enemy,
  GearSets,
  GearParts,
  Shop,
  CharacterPack,
  User,
  UserGear,
  UserGearParts
}
