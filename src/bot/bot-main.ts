'use strict';
import Telegraf from 'telegraf';
import { botToken, botName } from '../config/config';

// Create a new bot instance using our token and export it
const bot = new Telegraf(botToken, { username: botName });

bot.telegram.getMe().then((botInfo) => {
    bot.options.username = botInfo.username;
});

export default bot;