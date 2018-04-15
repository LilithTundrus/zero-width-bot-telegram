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

export default decodeScene;

