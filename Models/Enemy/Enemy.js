module.exports = (sequelize, DataTypes) => {
  return sequelize.define('enemy', {
    id: {
      type: DataTypes.INTEGER, // Define the appropriate data type for your primary key
      allowNull: false,
      primaryKey: true,
    },
    character_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    xp_awarded: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    unique_skill: {
      type: DataTypes.STRING,
      allowNull: true, // Allow null for this column
    },
    effective_damage: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    effective_health: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    chance_to_hit: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    crit_chance: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    crit_damage: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  })
}
