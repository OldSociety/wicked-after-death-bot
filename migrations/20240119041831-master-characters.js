'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
      await queryInterface.createTable('MasterCharacters',  {
        master_character_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
        },
        character_name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        cost: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        rarity: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        type: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        passive: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        passive_detail: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        base_damage: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        base_health: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        chance_to_hit: {
          type: Sequelize.FLOAT,
          allowNull: false,
          defaultValue: 0.0,
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
      },
      {
        timestamps: false,
      })},

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('MasterCharacter');
  }
};
