'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'StandardRaid',
      {
        raid_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        level_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        fight_number: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 1,
        },
      },
      {
        timestamps: false,
      }
    )
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('StandardRaid')
  },
}
