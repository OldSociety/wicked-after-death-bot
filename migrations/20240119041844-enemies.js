'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
      await queryInterface.createTable('Enemy',  {
        enemy_id: {
          type: Sequelize.INTEGER, // Define the appropriate data type for your primary key
          allowNull: false,
          primaryKey: true,
        },
        character_name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        level: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 1,
        },
        xp_awarded: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        gold_awarded: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        type: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        unique_skill: {
          type: Sequelize.STRING,
          allowNull: true, // Allow null for this column
        },
        effective_damage: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        effective_health: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        chance_to_hit: {
          type: Sequelize.FLOAT,
          allowNull: true,
        },
        crit_chance: {
          type: Sequelize.FLOAT,
          allowNull: true,
        },
        crit_damage: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
      })},

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Enemy');
  }
};
