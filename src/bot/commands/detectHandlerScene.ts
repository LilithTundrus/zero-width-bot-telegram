'use strict';
import * as zeroWidthToString from '../../lib/zeroWidthToString';
import Stage from 'telegraf/stage';
import Scene from 'telegraf/scenes/base';
import { detectKeyboard } from '../keyboardMarkups';

const { enter, leave } = Stage;
const detectScene = new Scene('detect');

// on enter, give a couple options and an explanation
detectScene.enter((ctx) => {
    // generate an object per user call 
    return ctx.reply('You are in detect mode now! use /back to leave, select an option to get started.', detectKeyboard)
        .then((ctx) => {
            // get the id of the message sent to later edit after user input is given
        })
    // send the keyboard markup
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
detectScene.on('text', (ctx) => {
    // Check if the message is has zero-wdith characters
    let stringFromZeroWidth = zeroWidthToString.default(ctx.message.text);
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
})

// on document, check file type and attempt a detect
detectScene.on('document', (ctx) => {
    if (ctx.message.document.file_name.includes('.txt')) {
        // TODO: we should do a much more stringent check
        ctx.reply(`Processing: ${ctx.message.document.file_name}`)
            .then((ctx) => {
                // we need the ID to later edit
                console.log(ctx);
                // process the document by reading the file one another thread (potentially using fibers)
            })
                        // make sure the file isn't stupid large here! 16kb maybe?
        console.log(ctx.message.document)
        ctx.telegram.getFileLink(ctx.message.document.file_id)
            .then((link) => {
                // link to download the file
                console.log(link);
                // get the file using request (lazy, no downloading)

            })
        // get the file from telegram
    } else {
        ctx.reply(`Please send a file in .txt format`);
    }

})

export default detectScene;