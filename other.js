const { Client, GatewayIntentBits } = require('discord.js');
const { createDiscordJSAdapter } = require('@discordjs/voice');
const Discord = require('discord.js')


const botCommands = [
  "join",
  "play",
  "pause"
]

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

const token = 'MTIwMzA2NDc5MzkyNjIwNTQ0MA.G78Bkx.lD24oPVFYKYryHgqdYu9DzxDgIyddKPkzDtUrY'; 
const audioFilePath = 'C:\\Users\\levia\\Desktop\\Atmos-Music\\Cinematic Atmos\\Cinematic Atmos.mp3';

client.options.permissions = 8;

client.login(token);

client.once('ready', (c) => {
  console.log(`The digital embodiment of ${client.user.tag} has finally arrived. Lets fucking go boys!... eventually`);
  client.user.setActivity('with your moms feelings');
});

client.on('messageCreate', async (message) => {
  // if (!(message.content.slice(1) in botCommands) && message.author.username !== "Atmos") { // TODO fix
  //   message.channel.send("WRONG again fucko!")
  //   console.log(message.content.slice(1));
  //   return
  // }
  if (message.content.toLowerCase() === '!join') {
    client.channels.cache.get("ChannelID")
    const channel = message.member.voice.channel;
    console.log(channel)

    if (!channel) {
      message.channel.send("channel doesnt exist or sum bro");
      return;
    }
    channel.joinable()

  //     const player = createAudioPlayer();
  //     const resource = createAudioResource(audioFilePath);

  //     player.play(resource);
  //     connection.subscribe(player);

  //     message.reply('Joined the voice channel and started playing audio!');
  //   } else {
  //     message.reply('You need to be in a voice channel to use this command!');
  //   }
  
    
  }
});
