'use strict';
// Main entry point for the bot

// #region imports
// Logging system (basic, gets attached to the bot)
import Logger from 'colorful-log-levels/logger';
import { logLevels } from 'colorful-log-levels/enums';
import bot from './bot/bot-main';
import { ver, prod, debug, adminID } from './config/config';
// Processing timer for getting 
import { elapsedTime, resetTimer } from './lib/timer';
// rate-limiter npm package for telegraf
import rateLimit from 'telegraf-ratelimit';
import session from 'telegraf/session';
import { Message } from 'telegram-typings';
// #endregion

// TODO: Handle messages that end up being over 2,048 characters
// TODO: Figure out how to let users set an encode message 'container' and a desired message to hide
// TODO: Handle groups vs. individual in the /start
// TODO: Make this less janky!!!!

/* 
Gaols/Features:
This bot will be for decoding/encoding messages through telegram using zero-width characters

It should also be able to detect for the user if a message has or hasn't been fingerprinted with zero-width characters
*/
let logger = new Logger('../logs', logLevels.error, true);

// Set limit to 3 message per 3 seconds using telegraf-ratelimit
const limitConfig = {
    window: 3000,
    limit: 3,
    onLimitExceeded: ((ctx, next) => {
        logger.warn(`${ctx.message.from.username} exceeded the rate limit at ${new Date().toTimeString()}`);
        ctx.reply('Rate limit exceeded. This instance will be reported.');
    })
};

bot.telegram.getMe().then((botInfo) => {
    bot.options.username = botInfo.username;
});

// Put middleware globally fo the bot here
bot.use(
    session(),
    rateLimit(limitConfig),
    require('./bot/commands/index'),
    // Allow for atached .then() to a ctx.reply()
    (ctx, next) => {
        const reply = ctx.reply;
        ctx.reply = (...args) => {
            ctx.session.lastMessage = args;
            reply(...args);
        };
        return next();
    },
);
// setInterval(sendThreadingTestMessage, 1 * 500);

// function sendThreadingTestMessage() {
//     // resetTimer();
//     logger.debug(`On the main thread at ${new Date().toISOString()}`)
//     // bot.telegram.sendMessage(adminID, new Date().toTimeString())
//     //     .then(() => elapsedTime('Sent message'))
// }

resetTimer();
if (debug) elapsedTime('Starting bot polling...');
// We're using polling for now since it's a bit simpler for development than webhooks
bot.startPolling();
if (debug) elapsedTime('Bot polling started');

logger.info(`zero-width-message-bot ${ver} started at: ${new Date().toISOString()}`);

// Attach functions/classes to the bot's context arguments passed to functions
bot.context.time = elapsedTime;
bot.context.resetTimer = resetTimer;
bot.context.logger = logger;

// Listen for any message sent to the bot (does not capture commands)
bot.on('message', (ctx) => {
    return ctx.logger.debug(`${ctx.message.from.username} sent ${ctx.message.text} at ${new Date().toTimeString()}`);
});

bot.catch((err) => {
    bot.telegram.sendMessage(adminID, err.toString());
    return logger.error(err);
});