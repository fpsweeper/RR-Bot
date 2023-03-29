const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('dashboard')
		.setDescription('Your PPC Bot'),
	async execute(interaction) {
		await interaction.reply('pp!');
	}
};
