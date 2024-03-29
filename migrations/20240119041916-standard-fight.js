'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'StandardFights',
      {
        fight_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        fight_name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        raid_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        enemy_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
      },
      {
        timestamps: false,
      }
    )
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('StandardFights')
  },
}
