'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'Characters',
      {
        character_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        user_id: {
          type: Sequelize.INTEGER,
        },
        master_character_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        level: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 1,
        },
        experience: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        xp_needed: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 1000,
        },
        effective_health: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        effective_damage: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        consecutive_kill: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        recovery_timestamp: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        initialized: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
      },
      {
        timestamps: false,
      }
    )
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Characters')
  },
}