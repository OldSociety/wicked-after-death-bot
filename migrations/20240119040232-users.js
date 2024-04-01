'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', { // Ensure this matches your Sequelize model's table name
      user_id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
      },
      user_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      balance: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      qubit_balance: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      last_daily_claim: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      daily_streak: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      currentChance: {
        type: Sequelize.DOUBLE,
        defaultValue: 0.05,
      },
      message_cooldownTime: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      scavenge_cooldownTime: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      fate_points: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users'); // This should match the name used in the up function
  },
};
