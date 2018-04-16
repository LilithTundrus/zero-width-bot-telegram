'use strict';
import zeroWidthToString from '../../lib/zeroWidthToString';
import stringToZeroWidth from '../../lib/stringToZeroWidth';
import Stage from 'telegraf/stage';
import Scene from 'telegraf/scenes/base';
import { cleanKeyboard } from '../keyboardMarkups';
import { adminID } from '../../config/config';
import { requestUrl } from '../../lib/request';
import * as fs from 'fs';

const { enter, leave } = Stage;
const cleanScene = new Scene('clean');

// on the 'clean' command, a user is brought into a scene to clean a message or document
cleanScene.enter((parentCtx) => {
    return parentCtx.reply('You are in 💊 Clean mode now! use /back or the exit button to leave. Send a message or file to be processed.', cleanKeyboard)
        .then((ctx) => {
            // get the id of the message sent to later edit after user input is given
            parentCtx.session.messageToEdit = ctx.message_id;
            parentCtx.session.lastSentMessage = 'You are in 💊 Clean mode now! use /back or the exit button to leave. Send a message or file to be processed.';
        })
})

cleanScene.leave((parentCtx) => {
    parentCtx.telegram.editMessageText(parentCtx.chat.id, parentCtx.session.messageToEdit, null, 'ℹ️ You just left the clean command, all base commands are now available using /menu!');
});

cleanScene.command('back', leave());
cleanScene.command('menu', leave());

// Listen for an exit callback
cleanScene.action('exit', (ctx) => {
    // 'answer' the CB, making the loading icon go away
    ctx.answerCbQuery(ctx.callbackQuery.data);
    return ctx.scene.leave();
});

cleanScene.action('message', (ctx) => {
    let messageToSend = 'ℹ️ Send me a copy-pasted set of text to remove zero-width characters!';
    // 'answer' the CB, making the loading icon go away
    ctx.answerCbQuery(ctx.callbackQuery.data);
    if (ctx.session.lastSentMessage !== messageToSend) {
        ctx.session.lastSentMessage = messageToSend;
        return ctx.telegram.editMessageText(ctx.chat.id, ctx.session.messageToEdit, null, messageToSend, cleanKeyboard);
    }
});

cleanScene.action('file', (ctx) => {
    let messageToSend = 'ℹ️ Send a file to remove zero-width characters!';
    // 'answer' the CB, making the loading icon go away
    ctx.answerCbQuery(ctx.callbackQuery.data);
    if (ctx.session.lastSentMessage !== messageToSend) {
        ctx.session.lastSentMessage = messageToSend;
        return ctx.telegram.editMessageText(ctx.chat.id, ctx.session.messageToEdit, null, messageToSend, cleanKeyboard);
    }
});

// on text, attempt a clean or scene change
cleanScene.on('text', (ctx) => {
    let userMessage = ctx.message.text.trim();
    // if text is a command, go to that scene!!
    if (userMessage == '💊 Clean') {
        // Doesn't work more than once annoyingly
        let messageToSend = 'ℹ️ You are already in the 💊 Clean command!';
        if (ctx.session.lastSentMessage !== messageToSend) {
            ctx.session.lastSentMessage = messageToSend;
            return ctx.telegram.editMessageText(ctx.chat.id, ctx.session.messageToEdit, null, messageToSend, cleanKeyboard);
        }
    } else if (userMessage == '✉️ Encode') {
        return ctx.scene.leave().then(() => {
            return ctx.scene.enter('encode');
        });
    } else if (userMessage == '📨 Decode') {
        // Doesn't work more than once annoyingly
        return ctx.scene.leave().then(() => {
            return ctx.scene.enter('decode');
        });
    } else if (userMessage == '🔍 Detect') {
        return ctx.scene.leave().then(() => {
            return ctx.scene.enter('detect');
        });
    }
    // Check if the message has zero-wdith characters
    if (zeroWidthCheck(userMessage) == false) {
        // Message does not contain anything we can detect
        let messageToSend = `✅ Given message did NOT contain zero-width characters`;
        if (ctx.session.lastSentMessage !== messageToSend) {
            ctx.session.lastSentMessage = messageToSend;
            return ctx.telegram.editMessageText(ctx.chat.id, ctx.session.messageToEdit, null, messageToSend, cleanKeyboard);
        }
    } else {
        let stringFromZeroWidth = zeroWidthToString(userMessage);
        // awful but it works
        let fixedString = userMessage.split('').filter(function (char) {
            if (char == "﻿" || /* <feff> */
                char == "​" || /* <200b> */
                char == "‌" || /* <200c> */
                char == "‍"    /* <200d> */) {
                return false;
            }
            return true;
        }).join('');
        let messageToSend = `✅ String with zero-wdith characters removed: ${fixedString}`;
        if (messageToSend.length > 2000) messageToSend = `⛔️ Sorry, the cleaned text was too long to send. The first 25 characters are: ${stringFromZeroWidth.substring(0, 24)}`;
        if (ctx.session.lastSentMessage !== messageToSend) {
            ctx.session.lastSentMessage = messageToSend;
            return ctx.telegram.editMessageText(ctx.chat.id, ctx.session.messageToEdit, null, messageToSend, cleanKeyboard);
        }
    }
})

cleanScene.on('document', (ctx) => {
    if (ctx.message.document.file_name.includes('.txt') && ctx.message.document.mime_type == 'text/plain') {
        // TODO: record the filename to a var to user later down below!!!
        ctx.telegram.editMessageText(ctx.chat.id, ctx.session.messageToEdit, null, `🕑 Processing: ${ctx.message.document.file_name} ...`);
        // process the document by reading the file  (potentially using fibers for threading)
        ctx.telegram.getFileLink(ctx.message.document.file_id)
            .then((link: string) => {
                ctx.telegram.sendChatAction(ctx.chat.id, 'typing');
                // get the file using request (lazy, no downloading)
                requestUrl(link, 'zero-width-bot-telegram-0.1.0')
                    .then((results: string) => {
                        let fixedString = results.split('').filter(function (char) {
                            if (char == "﻿" || /* <feff> */
                                char == "​" || /* <200b> */
                                char == "‌" || /* <200c> */
                                char == "‍"    /* <200d> */) {
                                return false;
                            }
                            return true;
                        }).join('');
                        // get the file, find a space, append the zero-width message there, if no spaces just append the zero-width message
                        fs.writeFile(`../temp/clean${ctx.chat.id}.txt`, `${fixedString}`, (err) => {
                            if (err) {
                                throw err;
                            }
                            console.log('File saved!');
                            ctx.replyWithDocument({
                                source: fs.createReadStream(`../temp/clean${ctx.chat.id}.txt`),
                                filename: `clean${ctx.chat.id}.txt`
                            })
                            let messageToSend = `✅ Your file is below, make sure that the file size is lowe than before if you suspect zero-width characters were in use`;
                            if (ctx.session.lastSentMessage !== messageToSend) {
                                ctx.session.lastSentMessage = messageToSend;
                                return ctx.telegram.editMessageText(ctx.chat.id, ctx.session.messageToEdit, null, messageToSend, cleanKeyboard);
                            }
                        });
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
            return ctx.telegram.editMessageText(ctx.chat.id, ctx.session.messageToEdit, null, messageToSend, cleanKeyboard);
        }
    } else {
        let messageToSend = `⛔️ Please send a file in .txt format`;
        if (ctx.session.lastSentMessage !== messageToSend) {
            ctx.session.lastSentMessage = messageToSend;
            return ctx.telegram.editMessageText(ctx.chat.id, ctx.session.messageToEdit, null, messageToSend, cleanKeyboard);
        }
    }
});

function zeroWidthCheck(textToCheck: string) {
    let stringFromZeroWidth = zeroWidthToString(textToCheck);
    // The length returned is always at the least 2, even with a single character provided which is weird
    if (stringFromZeroWidth.length <= 2) {
        return false;
    } else {
        return true;
    }
}

export default cleanScene;