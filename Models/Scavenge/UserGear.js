module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'user_gear',
    {
      character_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
      },
      gear_id: {
        type: DataTypes.INTEGER,
      },
      name: {
        type: DataTypes.STRING,
        unique: true,
      },
      rarity: {
        type: DataTypes.INTEGER,
      },
      level: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
      ability: {
        type: DataTypes.STRING,
      },
    },
    {
      timestamps: false,
    }
  )
}
