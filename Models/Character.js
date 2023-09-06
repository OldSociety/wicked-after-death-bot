module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
      'character',
      {
        character_id: {
          type: DataTypes.STRING,
          primaryKey: true,
        },
        character_name: {
            type: DataTypes.STRING,
            primaryKey: true,
          },
        damage: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
          allowNull: false,
        },
        health: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
          },
        chance_to_hit: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
        crit_chance: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
        crit_damage: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
        special_1: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
      },
      {
        timestamps: false,
      },
      { freezeTableName: true }
    )
  }
  