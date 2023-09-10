module.exports = (sequelize, DataTypes) => {
  const MasterCharacter = sequelize.define(
    'MasterCharacter',
    {
      master_character_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      character_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      cost: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      rarity: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      unique_skill: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      base_damage: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      base_health: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      chance_to_hit: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0.0,
      },
      crit_chance: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0.0,
      },
      crit_damage: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0.0,
      },
    },
    {
      timestamps: false,
    }
  )

  return MasterCharacter
}
