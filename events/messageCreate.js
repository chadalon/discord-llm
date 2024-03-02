const { Events } = require('discord.js');
const { openAIKey } = require('../config.json');
const axios = require('axios');
const openAIClient = axios.create({
    headers: { Authorization: "Bearer " + openAIKey },
});

const prefix = '!';

function ask(prompt, message) {
    const params = {
        messages: [{ role: "user", content: prompt }],
        model: "gpt-4",
    };
    openAIClient
        .post("https://api.openai.com/v1/chat/completions", params)
        .then((result) => {
            message.reply(result.data.choices[0].message.content);
        })
        .catch((err) => {
            console.log(err);
        });
}


function execute(message) {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

	var args = message.content.slice(prefix.length).trim();//.split(' ');
	var command = args.split(' ').shift().toLowerCase();
    args = args.slice(command.length).trim();
    
    if (command === "ask")
    {
        ask(args, message);
        return;
    }
    // message.reply(`command: ${command}, args: ${args}`);
    // if (message.content === 'ping') {
    //     message.reply('pong');
    // }
}
module.exports = {
	name: Events.MessageCreate,
    execute
};