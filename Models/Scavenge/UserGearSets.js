// UserGearPieces model
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('user_gear_sets', {
    user_id: {
      type: DataTypes.INTEGER,
    },
    gear_id: {
      type: DataTypes.INTEGER,
    },
  })
}
