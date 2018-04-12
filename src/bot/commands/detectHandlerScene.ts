'use strict';
import * as zeroWidthToString from '../../lib/zeroWidthToString';
import Stage from 'telegraf/stage';
import Scene from 'telegraf/scenes/base';
import * as request from 'request';
import { detectKeyboard } from '../keyboardMarkups';

const { enter, leave } = Stage;
const detectScene = new Scene('detect');

// on enter, give a couple options and an explanation
detectScene.enter((ctx) => {
    // send the keyboard markup
    return ctx.reply('You are in detect mode now! use /back to leave, send a message or file to be processed.', detectKeyboard)
        .then((ctx) => {
            console.log(ctx);
            // get the id of the message sent to later edit after user input is given (eventually)
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
    ctx.reply('Send me a message to detect for zero-width characters!');
});

detectScene.action('file', (ctx) => {
    // 'answer' the CB, making the loading icon go away
    ctx.answerCbQuery(ctx.callbackQuery.data);
    ctx.reply('Send me a file to detect for zero-width characters!');
});

// on text, attempt a detect
// TODO: Edit the main message instead of sending more and more messages
detectScene.on('text', (ctx) => {
    let userMessage = ctx.message.text.trim();
    // if text is a command like 💊 Clean, go to that scene!!
    if (userMessage == '💊 Clean') {
        // leave the scene and enter the next
    }
    // Check if the message is has zero-wdith characters
    let stringFromZeroWidth = zeroWidthToString.default(userMessage);
    // The length returned is always at the least 2, even with a single character provided which is weird
    if (stringFromZeroWidth.length <= 2) {
        // Message does not contain anything we can detect
        // ctx.telegram.sendChatAction(ctx.chat.id, 'typing');
        return ctx.reply(`Given message did not contain zero-width characters\n\n**NOTE:** Please do not use this as an end-all for detecting zero-width tracking detection method!`);
    }
    return ctx.reply(`String found by decoding zero-wdith characters: ${stringFromZeroWidth}\n\n**NOTE:** Please do not use this as an end-all for detecting zero-width tracking detection method!`);
})

// on document, check file type and attempt a detect
detectScene.on('document', (ctx) => {
    if (ctx.message.document.file_name.includes('.txt') && ctx.message.document.mime_type == 'text/plain') {
        console.log(ctx.message.document)
        // TODO: we should do a much more stringent check through telegram file-type property
        ctx.reply(`Processing: ${ctx.message.document.file_name}`)
            .then((ctx) => {
                // we need the ID to later edit
                console.log(ctx);
                // process the document by reading the file one another thread (potentially using fibers)
            })
        // make sure the file isn't stupid large here! 16kb maybe?
        console.log(ctx.message.document)
        // get the file from telegram
        ctx.telegram.getFileLink(ctx.message.document.file_id)
            .then((link) => {
                // link to download the file
                console.log(link);
                // get the file using request (lazy, no downloading)
                requestUrl(link, 'zero-width-bot-telegram-0.0.1')
                    .then((results) => {
                        // this should be plain text that we can clean
                        console.log(results);
                        // start typing a reply
                        // check for any zero-width characters
                        console.log(zeroWidthToString.default(results).length);
                        ctx.telegram.sendChatAction(ctx.chat.id, 'typing')
                            .then((ctx) => {

                            })
                        // edit the main message with the results
                    })
                    .catch((err) => {
                        // let the user know something went wrong and send a message to the admin
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
        headers: {
            'User-Agent': userAgent
        },
        json: true
    };
    return new Promise((resolve, reject) => {
        request.get(options, function (err: Error, response, body) {
            if (err) {
                return reject(err);
            }
            return resolve(body);
        })
    })
}

export default detectScene;