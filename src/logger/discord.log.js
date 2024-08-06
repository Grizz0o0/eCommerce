'use strict';
const { Client, GatewayIntentBits } = require('discord.js');
const { CHANNELID_DISCORD, TOKEN_DISCORD } = process.env;
const client = new Client({
    intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.on('ready', () => {
    console.log(`Logged is as ${client.user.tag}!`);
});

const token = TOKEN_DISCORD;
client.login(token);

client.on('messageCreate', (message) => {
    if (message.author.bot) return;
    if (message.content == 'hello') {
        message.reply(`Em có thể giúp gì cho đại ca !`);
    }
});
