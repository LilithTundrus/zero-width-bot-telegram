'use strict';
import zeroWidthToString from '../../lib/zeroWidthToString';
import stringToZeroWidth from '../../lib/stringToZeroWidth';
import Stage from 'telegraf/stage';
import Scene from 'telegraf/scenes/base';
import { cleanKeyboard } from '../keyboardMarkups';
import { adminID } from '../../config/config';
import { requestUrl } from '../../lib/request';
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
        if (ctx.session.lastSentMessage !== messageToSend) {
            ctx.session.lastSentMessage = messageToSend;
            return ctx.telegram.editMessageText(ctx.chat.id, ctx.session.messageToEdit, null, messageToSend, cleanKeyboard);
        }
    }
})

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