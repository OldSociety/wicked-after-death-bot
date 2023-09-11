module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'gear_sets',
    {
      gear_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      gear_name: {
        type: DataTypes.STRING,
      },
      rarity: {
        type: DataTypes.INTEGER,
      },
    },
    {
      timestamps: false,
    }
  )
}
