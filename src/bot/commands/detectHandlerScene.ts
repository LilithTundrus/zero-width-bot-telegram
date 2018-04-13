'use strict';
import * as zeroWidthToString from '../../lib/zeroWidthToString';
import Stage from 'telegraf/stage';
import Scene from 'telegraf/scenes/base';
import * as request from 'request';
import { detectKeyboard } from '../keyboardMarkups';
import { adminID } from '../../config/config';
const { enter, leave } = Stage;
const detectScene = new Scene('detect');

// on enter, give a couple options and an explanation
detectScene.enter((ctxParent) => {
    // send the keyboard markup
    console.log(ctxParent);
    return ctxParent.reply('You are in detect mode now! use /back to leave, send a message or file to be processed.', detectKeyboard)
        .then((ctx) => {
            // get the id of the message sent to later edit after user input is given
            ctxParent.session.messageToEdit = ctx.message_id;
        })
})

detectScene.leave((ctx) => {
    return ctx.reply('You just left the detect command, all base commands are now available using /menu!');
});

detectScene.command('back', leave());

// Listen for an exit callback
detectScene.action('exit', (ctx) => {
    // 'answer' the CB, making the loading icon go away
    ctx.answerCbQuery(ctx.callbackQuery.data);
    ctx.scene.leave();
});

detectScene.action('message', (ctx) => {
    // 'answer' the CB, making the loading icon go away
    ctx.answerCbQuery(ctx.callbackQuery.data);
    ctx.reply('Send me a copy-pasted set of text to check for zero-width characters!');
});

detectScene.action('file', (ctx) => {
    // 'answer' the CB, making the loading icon go away
    ctx.answerCbQuery(ctx.callbackQuery.data);
    ctx.reply('Send a file to check for zero-width characters!');
});

// on text, attempt a detect
// TODO: Edit the main message instead of sending more and more messages
detectScene.on('text', (ctx) => {
    let userMessage = ctx.message.text.trim();
    // if text is a command like 💊 Clean, go to that scene!!
    // TODO: Do this for all base commands
    if (userMessage == '💊 Clean') {
        // leave the scene and enter the next
    }
    // Check if the message is has zero-wdith characters
    if (zeroWidthCheck(userMessage) == false) {
        // Message does not contain anything we can detect
        return ctx.reply(`Given message did not contain zero-width characters\n\n**NOTE:** Please do not use this as an end-all for detecting zero-width tracking detection method!`);
    }
    let stringFromZeroWidth = zeroWidthToString.default(userMessage);
    return ctx.reply(`String found by decoding zero-wdith characters: ${stringFromZeroWidth}\n\n**NOTE:** Please do not use this as an end-all for detecting zero-width tracking detection method!`);
})

// on document, check file type and attempt a detect
detectScene.on('document', (ctx) => {
    if (ctx.message.document.file_name.includes('.txt') && ctx.message.document.mime_type == 'text/plain') {
        ctx.telegram.editMessageText(ctx.chat.id, ctx.session.messageToEdit, null, `Processing: ${ctx.message.document.file_name}`)
        // process the document by reading the file  (potentially using fibers for threading)
        ctx.telegram.getFileLink(ctx.message.document.file_id)
            .then((link) => {
                console.log(ctx.session.messageToEdit)
                // link to download the file
                console.log(link);
                ctx.telegram.sendChatAction(ctx.chat.id, 'typing');
                // get the file using request (lazy, no downloading)
                requestUrl(link, 'zero-width-bot-telegram-0.0.1')
                    .then((results: string) => {
                        // this should be plain text that we can clean
                        // check for any zero-width characters
                        console.log(zeroWidthToString.default(results));
                        if (zeroWidthCheck(results) == true) {
                            let stringFromZeroWidth = zeroWidthToString.default(results);
                            // edit the main message with the results
                            return ctx.telegram.editMessageText(ctx.chat.id, ctx.session.messageToEdit, null, `Document contained zero-width characters. Attempted deocde of characters: ${stringFromZeroWidth}\n\n**NOTE:** Please do not use this as an end-all for detecting zero-width tracking detection method!`, detectKeyboard);
                        }
                        return ctx.telegram.editMessageText(ctx.chat.id, ctx.session.messageToEdit, null, `Given file did NOT contain zero-width characters\n\n**NOTE:** Please do not use this as an end-all for detecting zero-width tracking detection method!`, detectKeyboard);

                    })
                    .catch((err) => {
                        // let the user know something went wrong and send a message to the admin
                        ctx.reply(`Looks like something went wrong with parsing your file. I've sent a ticket about the issue, please try again later!`);
                        ctx.telegram.sendMessage(adminID, err.toString());
                        return ctx.logger.error(err);
                    })
            })
        // check file size (should be under 16k)
    } else if (ctx.message.document.file_size > 16000) {
        ctx.reply(`Please send a file in text format under 16k`);
    } else {
        ctx.reply(`Please send a file in .txt format`);
    }
})

/**
 * Request an e621 URL using constant headers (user-agent, etc.)
 * @param {URL} url 
 * @returns {Promise<any>}
 */
function requestUrl(url: string, userAgent: string): Promise<any> {
    let options = {
        uri: url,
        headers: { 'User-Agent': userAgent },
        json: true
    };
    return new Promise((resolve, reject) => {
        request.get(options, function (err: Error, response, body) {
            if (err) return reject(err);
            return resolve(body);
        })
    })
}

function zeroWidthCheck(textToCheck: string) {
    let stringFromZeroWidth = zeroWidthToString.default(textToCheck);
    console.log(zeroWidthToString.default(textToCheck).length)
    // The length returned is always at the least 2, even with a single character provided which is weird
    if (stringFromZeroWidth.length <= 2) {
        return false;
    } else {
        return true;
    }
}

export default detectScene;