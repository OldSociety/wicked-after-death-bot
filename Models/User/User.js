module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    user_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    balance: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    last_daily_claim: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    daily_streak: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    currentChance: {
      type: DataTypes.DOUBLE,
      defaultValue: 0.05,
    },
    message_cooldownTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    scavenge_cooldownTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  })

  return User
}
