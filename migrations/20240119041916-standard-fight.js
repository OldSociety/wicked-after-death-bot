'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'StandardFight',
      {
        fight_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        raid_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        enemy_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
          }
      },
      {
        timestamps: false,
      }
    )
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('StandardFight')
  },
}
