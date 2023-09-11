module.exports = (sequelize, DataTypes) => {
  const Character = sequelize.define(
    'Character',
    {
      character_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
      },
      master_character_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      level: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      experience: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      xp_needed: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1000,
      },
      effective_health: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      effective_damage:{
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },


      // ... other unique attributes for each player's instance
    },
    {
      timestamps: false,
    }
  )

  return Character
}
