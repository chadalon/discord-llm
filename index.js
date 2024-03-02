const { Client, IntentsBitField, Collection, Events, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
//const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');

const client = new Client({ intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMessages, IntentsBitField.Flags.MessageContent] });
const { clientId, guildId, token } = require('./config.json');
client.commands = new Collection();

const commands = [];
// Grab all the command folders from the commands directory you created earlier
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	// Grab all the command files from the commands directory you created earlier
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			commands.push(command.data.toJSON());
      client.commands.set(command.data.name, command);
      console.log(command.data.toJSON());
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationCommands(clientId),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();


const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

client.login(token);

/*
const { Client, IntentsBitField, joinVoiceChannel, createAudioPlayer, createAudioResource } = require('discord.js');
// const { createDiscordJSAdapter } = require('@discordjs/voice');

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildVoiceStates,
  ],
});

const token = 'MTIwNTAzNzA0MDAyNzMwMzk3Ng.Gb8kcZ.y3484Ya3prEisGsZmLheMVR1ZZg_yyasOVKKRY'; 
const audioFilePath = 'C:\\Users\\levia\\Desktop\\Atmos-Music\\Cinematic Atmos\\Cinematic Atmos.mp3';

client.options.permissions = 8;

client.login(token);

client.once('ready', (c) => {
  console.log(`Logged in as ${client.user.tag} lets fucking go!`);
  client.user.setActivity('with your moms feelings');
});

client.on('messageCreate', (message) => {
  console.log(message);
})

client.on('messageCreate', message => {
  if (message.content.startsWith("!ping")) {
    message.channel.send('Pong!');
  }
});

client.on('messageCreate', async (message) => {
  if (message.content.toLowerCase() === '!join') {
    const channel = message.member.voice.channel;

    if (channel) {
      const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: createDiscordJSAdapter(channel),
      });

      const player = createAudioPlayer();
      const resource = createAudioResource(audioFilePath);

      player.play(resource);
      connection.subscribe(player);

      message.reply('Joined the voice channel and started playing audio!');
    } else {
      message.reply('You need to be in a voice channel to use this command!');
    }
  }
});*/