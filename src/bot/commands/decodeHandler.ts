'use strict';
import * as zeroWidthToString from '../../lib/zeroWidthToUsername';

// handle /encode command calls
export default async function startHandler(ctx) {
    ctx.resetTimer();
    ctx.time('Got decode message...');
    ctx.logger.info(`decode from ${JSON.stringify(ctx.message.from)}`);
    let messageToDecode: string = ctx.message.text.substring(8);
    if (messageToDecode.length < 1) {
        return ctx.reply(`Please give a message to decode`)
        .then(() => ctx.time('decode error message sent!'));
    } else {
        // Check if the message is even something we need to decode here!
        let stringFromZeroWidth = zeroWidthToString.default(messageToDecode);
        console.log(stringFromZeroWidth.length);
        // The length returned is always at the least 2???
        if (stringFromZeroWidth.length <= 2) {
            return ctx.reply(`Given message did not contain zero-width characters to decode, make sure you copied the entire encoded message!`)
            .then(() => ctx.time('decode error message sent!'));

        }
        return ctx.reply(`Decoded message: ${stringFromZeroWidth}`)
            .then(() => ctx.time('reply message sent!'));
    }
}
