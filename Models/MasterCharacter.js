module.exports = (sequelize, DataTypes) => {
    const MasterCharacter = sequelize.define('MasterCharacter', {
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
      // ... other shared attributes
    }, {
      timestamps: false,
    });
  
    return MasterCharacter;
  };
  