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
  });

  return User;
};
