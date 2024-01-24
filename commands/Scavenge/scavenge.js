const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { User, GearParts, UserGearParts } = require('../../Models/model');

// Define the cooldowns Map
const cooldowns = new Map();

// Function to check if a user is on cooldown
function isOnCooldown(userId) {
    const now = Date.now();
    if (cooldowns.has(userId)) {
      const cooldownEndTime = cooldowns.get(userId);
      if (now > cooldownEndTime) {
        // Cooldown has expired, remove the user from the map
        cooldowns.delete(userId);
        return false; // No longer on cooldown
      }
      return true; // Still on cooldown
    }
    return false; // Not on cooldown
  }

// Function to start the cooldown for a user
function startCooldown(userId) {
  const now = Date.now();
  const cooldownEndTime = now + 3600000; // 1 hour in milliseconds
  cooldowns.set(userId, cooldownEndTime);
}

// Function to calculate a random rarity
function pickRarity() {
  const rand = Math.random() * 100;
  if (rand < 60) return 'common';
  if (rand < 90) return 'uncommon';
  return 'rare';
}

// Function to scavenge gear parts
async function scavengeGearParts(userId, chanceToFind) {
  if (Math.random() < chanceToFind) {
    console.log('Scavenging for gear parts for user ID:', userId);
    const rarity = pickRarity(); // Ensure pickRarity is defined
    const allParts = await GearParts.findAll({ where: { rarity } });
    const randomPart = allParts[Math.floor(Math.random() * allParts.length)];
    const [userGearPart, created] = await UserGearParts.findOrCreate({
      where: { user_id: userId, parts_id: randomPart.parts_id },
      defaults: { quantity: 0 },
    });
    await userGearPart.increment('quantity', { by: 1 });

    const embed = new EmbedBuilder().setDescription('You have found something!');

    return embed;
  } else {
    const embed = new EmbedBuilder().setDescription('Nothing found.');
    return embed;
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('scavenge')
    .setDescription('Scavenge for mithril artifice parts'),

  async execute(interaction) {
    try {
      if (!interaction || !interaction.user) {
        console.error('Invalid interaction or interaction user.');
        return;
      }

      const userId = interaction.user.id;
      console.log('User ID:', userId);
      const baseChance = 0.01;
      console.log(0, userId);
      console.log('Command received for user ID:', userId);

      const user = await User.findByPk(userId);
      console.log('User:', user);

      if (!user) {
        console.log('No user found for user ID:', userId);
        return interaction.reply(
          'No user found. Type `/account` to activate now.'
        );
      }

      console.log('Is on cooldown:', isOnCooldown(userId));

      // Check if the user is on cooldown
      if (isOnCooldown(userId)) {
        const now = Date.now();
        const cooldownTime = cooldowns.get(userId);
        const timeRemaining = (cooldownTime - now) / 1000; // Convert to seconds
        console.log('Cooldown time remaining:', timeRemaining);
        return interaction.reply(
          `You can scavenge again in ${timeRemaining.toFixed(0)} seconds.`
        );
      }
      const currentTime = new Date();
      console.log('Current time:', currentTime);

      // Check if user.scavenge_cooldownTimer is null or undefined, and use the default value if needed
      const userCooldownTimer =
        user.scavenge_cooldownTimer !== null && user.scavenge_cooldownTimer !== undefined
          ? user.scavenge_cooldownTimer
          : 0;

      // Scavenge gear parts
      const resultEmbed = await scavengeGearParts(
        userId,
        userCooldownTimer || baseChance
      );

      // Update scavenge_cooldownTimer
      if (user.scavenge_cooldownTimer === null || user.scavenge_cooldownTimer === undefined) {
        user.scavenge_cooldownTimer = baseChance;
      }

      // Set the user on cooldown
      startCooldown(userId);

      console.log('Scavenging completed for user ID:', userId);

      // Send the result to the user
      return interaction.reply({ embeds: [resultEmbed] });
    } catch (error) {
      console.error('Error:', error);
      return interaction.reply(
        'Something went wrong while scavenging for gear parts.'
      );
    }
  },
};
