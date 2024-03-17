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
        rank: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 1,
        },
        copies: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
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
        crit_chance: {
          type: Sequelize.FLOAT,
          allowNull: false,
          defaultValue: 0.0,
        },
        crit_damage: {
          type: Sequelize.FLOAT,
          allowNull: false,
          defaultValue: 1.5,
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
        in_deck: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          allowNull: false
        }
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
