'use strict';
import * as stringToZeroWidth from '../../lib/usernameToZeroWidth';

// handle /encode command calls
export default async function encodeHandler(ctx) {
    ctx.resetTimer();
    ctx.time('Got encode message request...');
    ctx.logger.info(`encode request from ${JSON.stringify(ctx.message.from)}`);
    let messageToEncode: string = ctx.message.text.substring(8);
    if (messageToEncode.length < 1) {
        return ctx.reply(`Please give a message to encode`);
    } else {
    // We want to be able to take a placeholder string from the user
    console.log(messageToEncode)
    let zeroWidthString = stringToZeroWidth.default(messageToEncode);
    // console.log(`This contains your message ${zeroWidthString}`)
    return ctx.reply(`AAAA${zeroWidthString}`)
        .then(() => ctx.time('encoded reply message sent!'));
    }
}
