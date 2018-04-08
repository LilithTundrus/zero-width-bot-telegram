'use strict';
import * as zeroWidthToString from '../../lib/zeroWidthToString';

// handle /encode command calls
export default async function detectHandler(ctx) {
    ctx.resetTimer();
    ctx.time('Got detect message...');
    ctx.logger.info(`detect from ${JSON.stringify(ctx.message.from)}`);
    let messageToDetect: string = ctx.message.text.substring(8).trim();
    // make sure the /detect argument has a string to detect
    if (messageToDetect.length < 1) {
        return ctx.reply(`Please give a message to detect for zero-width characters/tracking`)
            .then(() => ctx.time('detect error message sent!'));
    } else {
        // Check if the message is has zero-wdith characters
        let stringFromZeroWidth = zeroWidthToString.default(messageToDetect);
        console.log(stringFromZeroWidth.length);
        // The length returned is always at the least 2, even with a single character provided which is weird
        if (stringFromZeroWidth.length <= 2) {
            // Message does not contain anything we can detect
            ctx.telegram.sendChatAction(ctx.chat.id, 'typing')
            return ctx.reply(`Given message did not contain zero-width characters\n\n**NOTE:** Please do not use this as an end-all for detecting zero-width tracking detection method!`)
                .then(() => ctx.time('detect error message sent!'));
        }
        return ctx.reply(`String found by decoding zero-wdith characters: ${stringFromZeroWidth}\n\n**NOTE:** Please do not use this as an end-all for detecting zero-width tracking detection method!`)
            .then(() => ctx.time('reply message sent!'));
    }
}