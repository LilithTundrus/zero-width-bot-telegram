'use strict';
import * as zeroWidthToString from '../../lib/zeroWidthToString';
import Stage from 'telegraf/stage';
import Scene from 'telegraf/scenes/base';
import { decodeKeyboard } from '../keyboardMarkups';
import { adminID } from '../../config/config';
import { requestUrl } from '../../lib/request';
const { enter, leave } = Stage;
const decodeScene = new Scene('decode');

// on the 'decode' command, a user is brought into a scene to craft a container and message
decodeScene.enter((parentCtx) => {
    return parentCtx.reply('You are in 📨 Decode mode now! use /back or the exit button to leave. Send a message or file to be processed.', decodeKeyboard)
        .then((ctx) => {
            // get the id of the message sent to later edit after user input is given
            parentCtx.session.messageToEdit = ctx.message_id;
            parentCtx.session.lastSentMessage = 'You are in 📨 Decode mode now! use /back or the exit button to leave. Send a message or file to be processed.';
        })
})

decodeScene.leave((parentCtx) => {
    parentCtx.telegram.editMessageText(parentCtx.chat.id, parentCtx.session.messageToEdit, null, 'ℹ️ You just left the decode command, all base commands are now available using /menu!');
});

decodeScene.command('back', leave());
decodeScene.command('menu', leave());

// Listen for an exit callback
// TODO: DELETE any messages sent using a scene cleanup set of code
decodeScene.action('exit', (ctx) => {
    // 'answer' the CB, making the loading icon go away
    ctx.answerCbQuery(ctx.callbackQuery.data);
    return ctx.scene.leave();
});


decodeScene.action('message', (ctx) => {
    let messageToSend = 'ℹ️ Send me a copy-pasted set of text to decode zero-width characters!';
    // 'answer' the CB, making the loading icon go away
    ctx.answerCbQuery(ctx.callbackQuery.data);
    if (ctx.session.lastSentMessage !== messageToSend) {
        ctx.session.lastSentMessage = messageToSend;
        return ctx.telegram.editMessageText(ctx.chat.id, ctx.session.messageToEdit, null, messageToSend, decodeKeyboard);
    }
});

decodeScene.action('file', (ctx) => {
    let messageToSend = 'ℹ️ Send a file to decode for zero-width characters!';
    // 'answer' the CB, making the loading icon go away
    ctx.answerCbQuery(ctx.callbackQuery.data);
    if (ctx.session.lastSentMessage !== messageToSend) {
        ctx.session.lastSentMessage = messageToSend;
        return ctx.telegram.editMessageText(ctx.chat.id, ctx.session.messageToEdit, null, messageToSend, decodeKeyboard);
    }
});

// on text, attempt a decode or scene change
decodeScene.on('text', (ctx) => {
    let userMessage = ctx.message.text.trim();
    // if text is a command, go to that scene!!
    if (userMessage == '💊 Clean') {
        // leave the scene and enter the next
        return ctx.scene.leave().then(() => {
            return ctx.scene.enter('clean');
        });
    } else if (userMessage == '✉️ Encode') {
        return ctx.scene.leave().then(() => {
            return ctx.scene.enter('encode');
        });
    } else if (userMessage == '📨 Decode') {
        // Doesn't work more than once annoyingly
        let messageToSend = 'ℹ️ You are already in the 🔍 Detect command!';
        if (ctx.session.lastSentMessage !== messageToSend) {
            ctx.session.lastSentMessage = messageToSend;
            return ctx.telegram.editMessageText(ctx.chat.id, ctx.session.messageToEdit, null, messageToSend, decodeKeyboard);
        }
    } else if (userMessage == '🔍 Detect') {
        return ctx.scene.leave().then(() => {
            return ctx.scene.enter('detect');
        });
    }
    // Check if the message is has zero-wdith characters
    if (zeroWidthCheck(userMessage) == false) {
        // Message does not contain anything we can detect
        let messageToSend = `⚠️ Given message did NOT contain zero-width characters`;
        if (ctx.session.lastSentMessage !== messageToSend) {
            ctx.session.lastSentMessage = messageToSend;
            return ctx.telegram.editMessageText(ctx.chat.id, ctx.session.messageToEdit, null, messageToSend, decodeKeyboard);
        }
    } else {
        let stringFromZeroWidth = zeroWidthToString.default(userMessage);
        let messageToSend = `✅ String found by decoding zero-wdith characters: ${stringFromZeroWidth}`;
        if (ctx.session.lastSentMessage !== messageToSend) {
            ctx.session.lastSentMessage = messageToSend;
            return ctx.telegram.editMessageText(ctx.chat.id, ctx.session.messageToEdit, null, messageToSend, decodeKeyboard);
        }
    }
})

// on document, check file type and attempt a decode
decodeScene.on('document', (ctx) => {
    if (ctx.message.document.file_name.includes('.txt') && ctx.message.document.mime_type == 'text/plain') {
        ctx.telegram.editMessageText(ctx.chat.id, ctx.session.messageToEdit, null, `🕑 Processing: ${ctx.message.document.file_name} ...`);
        // process the document by reading the file  (potentially using fibers for threading)
        ctx.telegram.getFileLink(ctx.message.document.file_id)
            .then((link) => {
                // link to download the file
                console.log(link);
                ctx.telegram.sendChatAction(ctx.chat.id, 'typing');
                // get the file using request (lazy, no downloading)
                requestUrl(link, 'zero-width-bot-telegram-0.0.1')
                    .then((results: string) => {
                        // check for any zero-width characters
                        console.log(zeroWidthToString.default(results));
                        if (zeroWidthCheck(results) == true) {
                            let stringFromZeroWidth = zeroWidthToString.default(results);
                            // edit the main message with the results, the previous message is ALWAYS 'Processing...
                            let messageToSend = `✅ Document contained zero-width characters. Decoded string: ${stringFromZeroWidth}`;
                            return ctx.telegram.editMessageText(ctx.chat.id, ctx.session.messageToEdit, null, messageToSend, decodeKeyboard);
                        } else {
                            let messageToSend = `⚠️ Given file did NOT contain zero-width characters`;
                            return ctx.telegram.editMessageText(ctx.chat.id, ctx.session.messageToEdit, null, messageToSend, decodeKeyboard);
                        }
                    })
                    .catch((err) => {
                        // let the user know something went wrong and send a message to the admin
                        ctx.reply(`⛔️ Looks like something went wrong with parsing your file. I've sent a ticket about the issue, please try again later!`);
                        ctx.scene.leave();
                        ctx.telegram.sendMessage(adminID, err.toString());
                        return ctx.logger.error(err);
                    })
            })
        // check file size (should be under 16k)
    } else if (ctx.message.document.file_size > 16000) {
        let messageToSend = `⛔️ Please send a file in text format under 16k`;
        if (ctx.session.lastSentMessage !== messageToSend) {
            ctx.session.lastSentMessage = messageToSend;
            return ctx.telegram.editMessageText(ctx.chat.id, ctx.session.messageToEdit, null, messageToSend, decodeKeyboard);
        }
    } else {
        let messageToSend = `⛔️ Please send a file in .txt format`;
        if (ctx.session.lastSentMessage !== messageToSend) {
            ctx.session.lastSentMessage = messageToSend;
            return ctx.telegram.editMessageText(ctx.chat.id, ctx.session.messageToEdit, null, messageToSend, decodeKeyboard);
        }
    }
})



function zeroWidthCheck(textToCheck: string) {
    let stringFromZeroWidth = zeroWidthToString.default(textToCheck);
    // The length returned is always at the least 2, even with a single character provided which is weird
    if (stringFromZeroWidth.length <= 2) {
        return false;
    } else {
        return true;
    }
}

export default decodeScene;