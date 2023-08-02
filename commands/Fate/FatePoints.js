const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('points')
		.setDescription('Shows current fate points.'),
	async execute(interaction) {
		await interaction.reply('You have' + str(points) +  'points');
	},
};