module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
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
    resin_total: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    plate_total: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    weave_total: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    core_total: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  });

  return User;
};
