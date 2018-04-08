'use strict'

export default async function startHandler(ctx) {
    ctx.resetTimer();
    ctx.time('Sending welcome message...');
    ctx.logger.info(`Start from ${JSON.stringify(ctx.message.from)}`)
    return ctx.reply(`Hi @${ctx.message.from.username} \n\nI'm a bot that can help you encode/decode messages hidden in plain sight! I can also help you detect if a string has/has not been fingerprinted with zero-width characters.\n\nNot sure what any of this means? Check this out: https://medium.com/@umpox/be-careful-what-you-copy-invisibly-inserting-usernames-into-text-with-zero-width-characters-18b4e6f17b66\n\nPlease note this is still in development!`)
        .then(() => ctx.time('Message sent!'));
}