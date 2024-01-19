'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
     await queryInterface.renameTable('CharacterPack', 'CharacterPacks');
     
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.renameTable('CharacterPacks', 'CharacterPack');
  }
};
