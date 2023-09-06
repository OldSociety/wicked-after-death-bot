module.exports = (sequelize, DataTypes) => {
    return sequelize.define('enemy', {
      character_id: {
        type: DataTypes.STRING,
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
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      unique_skill: {
        type: DataTypes.STRING,
        allowNull: true, // Allow null for this column
      },
      base_damage: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      base_health: {
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
  