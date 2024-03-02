const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
        // console.log(interaction);
		await interaction.reply('Pong!');
        fs.writeFileSync('test.js', 'module.exports = {execute(){console.log("poop");}}');
        const poop = require('../../test.js');
        poop.execute();
        console.log("did it work");
	},
};