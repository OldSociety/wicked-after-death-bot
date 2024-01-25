'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'StandardRaids',
      {
        raid_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        raid_name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        level_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        fight_total: {
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
    await queryInterface.dropTable('StandardRaids')
  },
}
