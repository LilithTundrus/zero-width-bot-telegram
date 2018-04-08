'use strict';
import * as zeroWidthToString from '../../lib/zeroWidthToUsername';

// handle /encode command calls
export default async function startHandler(ctx) {
    ctx.resetTimer();
    ctx.time('Got decode message...');
    ctx.logger.info(`decode from ${JSON.stringify(ctx.message.from)}`);
    // Check if the message is even something we need to decode here!
    let messageToDecode: string = ctx.message.text.substring(8);
    if (messageToDecode.length < 1) {
        return ctx.reply(`Please give a message to decode`);
    } else {
        let stringFromZeroWidth = zeroWidthToString.default(messageToDecode);
        return ctx.reply(`Decoded message: ${stringFromZeroWidth}`)
            .then(() => ctx.time('reply message sent!'));
    }
}
