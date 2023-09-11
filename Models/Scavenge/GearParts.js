module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'gear_parts',
    {
      parts_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      type: {
        type: DataTypes.STRING,
      },
      rarity: {
        type: DataTypes.STRING,
      },
    },
    {
      timestamps: false,
    }
  )
}
