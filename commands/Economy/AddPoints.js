const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('addcoins')
		.setDescription('Adds fate points to account.'),
	async execute(interaction) {
        async function addBalance(id, amount) {
            const user = currency.get(id);
        
            if (user) {
                user.balance += Number(amount);
                return user.save();
            } else {
                await interaction.reply(`Please enter a username.`)
            }
        
            const newUser = await Users.create({ user_id: id, balance: amount });
            currency.set(id, newUser);
        
            return newUser;
        }
        await interaction.reply(`You have added ${amount} fate points!`);
	},
};