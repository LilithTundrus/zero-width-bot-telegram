'use strict';
import * as zeroWidthToString from '../../lib/zeroWidthToString';
import Stage from 'telegraf/stage';
import Scene from 'telegraf/scenes/base';
import { cleanKeyboard } from '../keyboardMarkups';
import { adminID } from '../../config/config';
import { requestUrl } from '../../lib/request';
const { enter, leave } = Stage;
const cleanScene = new Scene('clean');

// on the 'clean' command, a user is brought into a scene to craft a container and message
cleanScene.enter((parentCtx) => {
    return parentCtx.reply('You are in 💊 Clean mode now! use /back or the exit button to leave. Send a message or file to be processed.', cleanKeyboard)
        .then((ctx) => {
            // get the id of the message sent to later edit after user input is given
            parentCtx.session.messageToEdit = ctx.message_id;
            parentCtx.session.lastSentMessage = 'You are in 💊 Clean mode now! use /back or the exit button to leave. Send a message or file to be processed.';
        })
})

cleanScene.leave((parentCtx) => {
    parentCtx.telegram.editMessageText(parentCtx.chat.id, parentCtx.session.messageToEdit, null, 'ℹ️ You just left the decode command, all base commands are now available using /menu!');
});

cleanScene.command('back', leave());
cleanScene.command('menu', leave());

// Listen for an exit callback
// TODO: DELETE any messages sent using a scene cleanup set of code
cleanScene.action('exit', (ctx) => {
    // 'answer' the CB, making the loading icon go away
    ctx.answerCbQuery(ctx.callbackQuery.data);
    return ctx.scene.leave();
});

export default cleanScene;