const { SlashCommandBuilder } = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('convert')
    .setDescription(
      'Convert PHB base-10 currency to Meridian base-100 currency'
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('currency')
        .setDescription('Convert PHB Currency')

        .addIntegerOption((option) =>
          option
            .setName('copper')
            .setDescription('Amount of copper')
            .setRequired(false)
        )
        .addIntegerOption((option) =>
          option
            .setName('silver')
            .setDescription('Amount of silver')
            .setRequired(false)
        )
        .addIntegerOption((option) =>
          option
            .setName('gold')
            .setDescription('Amount of gold')
            .setRequired(false)
        )
        .addIntegerOption((option) =>
          option
            .setName('platinum')
            .setDescription('Amount of platinum')
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('help')
        .setDescription('Get information about Meridian currency formatting')
    ),

  async execute(interaction) {
    if (interaction.options.getSubcommand() === 'currency') {
      const copper = interaction.options.getInteger('copper') || 0
      const silver = interaction.options.getInteger('silver') || 0
      const gold = interaction.options.getInteger('gold') || 0
      const platinum = interaction.options.getInteger('platinum') || 0

      // Check for negative values
      if (copper < 0 || silver < 0 || gold < 0 || platinum < 0) {
        await interaction.reply('Please enter non-negative values.')
        return
      }

      const convertedAmount = convertCurrency(copper, silver, gold, platinum)
      const formattedAmount = formatCurrency(convertedAmount)
      const addCommas = (number) => number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

      let phbCurrencyString = ''

      if (platinum > 0) {
        phbCurrencyString += `${platinum} pp `
      }
      if (gold > 0) {
        phbCurrencyString += `${gold} gp `
      }
      if (silver > 0) {
        phbCurrencyString += `${silver} sp `
      }
      if (copper > 0) {
        phbCurrencyString += `${copper} cp`
      }
   
      const replyString = `**${addCommas(phbCurrencyString).trim()}** PHB = ${formattedAmount} in Meridian currency`;


      await interaction.reply(replyString)
    } else if (interaction.options.getSubcommand() === 'help') {
      // Help response
      await interaction.reply(
        `Meridian currency is based on a base-100 system and formatted as follows:\n` +
          `- **7 gold, 45 silver, 20 copper**: \`7.4520g\`\n` +
          `- **0 gold, 55 silver, 99 copper**: \`55.99s\`\n` +
          `- **0 gold, 0 silver, 30 copper**: \`30c\`\n` +
          `- **15 gold, 0 silver, 5 copper**: \`15.0005g\``
      )
    }
  },
}

function convertCurrency(copper, silver, gold, platinum) {
    // Convert everything to copper first
    const totalCopper = copper + silver * 10 + gold * 100 + platinum * 1000;

    // Convert copper to base-100 Platinum, Gold, Silver, Copper
    const base100Platinum = Math.floor(totalCopper / 1000000);
    const remainderAfterPlatinum = totalCopper % 1000000;

    const base100Gold = Math.floor(remainderAfterPlatinum / 10000);
    const remainderAfterGold = remainderAfterPlatinum % 10000;

    const base100Silver = Math.floor(remainderAfterGold / 100);
    const base100Copper = remainderAfterGold % 100;

    return {
        platinum: base100Platinum,
        gold: base100Gold,
        silver: base100Silver,
        copper: base100Copper
    };
}

function formatCurrency({ platinum, gold, silver, copper }) {
    // Helper function to add commas for large numbers
    const addCommas = (number) => number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    // Helper function to ensure two digits
    const ensureTwoDigits = (number) => number > 0 ? number.toString().padStart(2, '0') : '00';

    let formattedCurrency = '';
    let breakdown = '';

    // Determine if more than one type of currency is present
    const currencyTypes = [platinum, gold, silver, copper].filter(amount => amount > 0).length;

    if (platinum > 0) {
        formattedCurrency = `${addCommas(platinum)}.${ensureTwoDigits(gold)}p`;
        if (currencyTypes > 1) {
            breakdown = ` (${addCommas(platinum)}p ${gold}g ${silver}s ${copper}c)`;
        }
    } else if (gold > 0) {
        formattedCurrency = `${ensureTwoDigits(gold)}.${ensureTwoDigits(silver)}g`;
        if (currencyTypes > 1) {
            breakdown = ` (${gold}g ${silver}s ${copper}c)`;
        }
    } else if (silver > 0) {
        formattedCurrency = `${ensureTwoDigits(silver)}.${ensureTwoDigits(copper)}s`;
        if (currencyTypes > 1) {
            breakdown = ` (${silver}s ${copper}c)`;
        }
    } else {
        formattedCurrency = `${copper}c`;
    }

    return `**${formattedCurrency}**` + breakdown;
}
