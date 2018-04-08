'use strict';
import * as zeroWidthToString from '../../lib/zeroWidthToString';

// handle /encode command calls
export default async function decodeHandler(ctx) {
    ctx.resetTimer();
    ctx.time('Got decode message...');
    ctx.logger.info(`decode from ${JSON.stringify(ctx.message.from)}`);
    let messageToDecode: string = ctx.message.text.substring(8).trim();
    // make sure the /decode argument has a string to decode
    if (messageToDecode.length < 1) {
        return ctx.reply(`Please give a message to decode`)
            .then(() => ctx.time('decode error message sent!'));
    } else {
        // Check if the message is even something we need to decode!
        let stringFromZeroWidth = zeroWidthToString.default(messageToDecode);
        // The length returned is always at the least 2, even with a single character provided which is weird
        if (stringFromZeroWidth.length <= 2) {
            // Message does not contain anything we can decode
            return ctx.reply(`Given message did not contain zero-width characters to decode, make sure you copied the entire encoded message!`)
                .then(() => ctx.time('decode error message sent!'));
        }
        return ctx.reply(`Decoded message: ${stringFromZeroWidth}`)
            .then(() => ctx.time('reply message sent!'));
    }
}
