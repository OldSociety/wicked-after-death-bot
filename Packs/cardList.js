const fs = require('fs/promises')
const path = require('path')
const { Sequelize, DataTypes } = require('sequelize')
const sequelize = require('../../Utils/sequelize')

const Shop = require('./models/shop')(sequelize, DataTypes) // Import your Sequelize model for the shop

const fs = require('fs/promises');
const path = require('path');

// Function to read card files and create a card list
async function createCardList() {
  const cardList = [];

  const cardsDir = path.join(__dirname, 'cards'); // Path to the 'cards' directory

  try {
    const files = await fs.readdir(cardsDir);

    for (const file of files) {
      if (file.endsWith('.js')) {
        const cardData = require(path.join(cardsDir, file));
        cardList.push(cardData);
      }
    }

    return cardList;
  } catch (error) {
    console.error('Error reading card files:', error);
    return [];
  }
}

module.exports = createCardList();
