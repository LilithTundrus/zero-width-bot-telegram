'use strict';
import * as stringToZeroWidth from '../../lib/usernameToZeroWidth'

// handle /encode command calls
export default async function startHandler(ctx) {
    ctx.resetTimer();
    ctx.time('Got encode message...');
    ctx.logger.info(`encode from ${JSON.stringify(ctx.message.from)}`)
    let zeroWidthString = stringToZeroWidth.default('simple_test')
    // console.log(`This contains your message ${zeroWidthString}`)
    return ctx.reply(`This contains your message ${zeroWidthString}`)
        .then(() => ctx.time('reply message sent!'));
}
