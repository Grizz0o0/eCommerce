'use strict';
const { Client, GatewayIntentBits } = require('discord.js');
const { CHANNELID_DISCORD, TOKEN_DISCORD } = process.env;

class LoggerService {
    constructor() {
        this.client = new Client({
            intents: [
                GatewayIntentBits.DirectMessages,
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
            ],
        });

        // add channelID
        this.channelId = CHANNELID_DISCORD;

        this.client.on('ready', () => {
            console.log(`Logged is as ${this.client.user.tag}!`);
        });

        this.client.on('messageCreate', (message) => {
            if (message.author.bot) return;
            if (message.content == 'hello') {
                message.reply(`Em có thể giúp gì cho đại ca !`);
            }
        });

        this.client.login(TOKEN_DISCORD);
    }

    sendToFormatCode(logData) {
        const {
            code,
            message = 'This is some additional information about the code.',
            title = 'Code Example',
        } = logData;

        const codeMassage = {
            content: message,
            embeds: [
                {
                    color: parseInt('00ff00', 16), // convert hexadecimal color code to integer
                    title,
                    description:
                        '```json\n' + JSON.stringify(code, null, 2) + '\n ```',
                },
            ],
        };

        const channel = this.client.channels.cache.get(this.channelId);

        console.log(`channel::: ${channel}`);
        console.log(`channelID::: ${CHANNELID_DISCORD}`);
        console.log(`logData::: ${logData}`);
        if (!channel) {
            console.error(`Couldn't find the channel. ${this.channelId}`);
            return;
        }

        this.sendToMassage(codeMassage);
    }

    sendToMassage(message = 'message') {
        const channel = this.client.channels.cache.get(this.channelId);
        if (!channel) {
            console.error(`Couldn't find the channel: ${this.channelId}`);
            return;
        }

        channel.send(message).catch((e) => console.error(e));
    }
}

module.exports = new LoggerService();
