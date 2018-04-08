'use strict';
import * as stringToZeroWidth from '../../lib/stringToZeroWidth';

// handle /encode command calls
export default async function encodeHandler(ctx) {
    ctx.resetTimer();
    ctx.time('Got encode message request...');
    ctx.logger.info(`encode request from ${JSON.stringify(ctx.message.from)}`);
    let messageToEncode: string = ctx.message.text.substring(8).trim();
    if (messageToEncode.length < 1) {
        return ctx.reply(`Please give a message to encode`);
    } else {
    // We want to be able to take a placeholder string from the user
    console.log(messageToEncode)
    let zeroWidthString = stringToZeroWidth.default(messageToEncode);
    // TODO: We want this to allow the user to make a container with the encode message,
    // the bot accepting the container and then asking for a message to hid inside the container
    return ctx.reply(`This text contains your message${zeroWidthString}`)
        .then(() => ctx.time('encoded reply message sent!'));
    }
}
