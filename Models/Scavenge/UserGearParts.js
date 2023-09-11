  // UserGearPieces model
  module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
      'user_gear_parts',
      {
        user_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
        },
        parts_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
        },
        quantity: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
      },
      {
        timestamps: false,
      }
    )
  }
  