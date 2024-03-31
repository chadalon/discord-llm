const { Events } = require('discord.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`Ready! Bot is logged in`);// as ${client.user.tag}`);
	},
};