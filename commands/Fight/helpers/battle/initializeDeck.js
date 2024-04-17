// Import the array of cards
const testCardData = require('../../../../db/dbTestCards');

// Function to initialize the deck
function initializeDeck() {
  // Create a copy of the cards array to avoid modifying the original array
  const deck = [...testCardData];

  // Shuffle the deck
  shuffleDeck(deck);

  return deck;
}

// Function to shuffle the deck
function shuffleDeck(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]]; // Swap elements
  }
}

// Example usage
const deck = initializeDeck()
console.log(deck)
