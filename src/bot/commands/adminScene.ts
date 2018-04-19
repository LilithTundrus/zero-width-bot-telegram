import Stage from 'telegraf/stage';
import Scene from 'telegraf/scenes/base';
import { adminKeyboard } from '../keyboardMarkups';
import { adminID } from '../../config/config';
const { enter, leave } = Stage;
const adminScene = new Scene('decode');

// All admin commands are accessed through here

// on the 'admin' command, a user is brought into a scene to mannage bot functionality
adminScene.enter((parentCtx) => {
    // We only want the registered admin accessing this
    if (parentCtx.chat.id == adminID) {
        let messageToSend = 'You are in 🕶 Admin mode now. Use /back or the exit button to leave.';
        return parentCtx.reply(messageToSend, adminKeyboard)
            .then((ctx) => {
                // get the id of the message sent to later edit after user input is given
                parentCtx.session.messageToEdit = ctx.message_id;
                // For preventing telegram '400: no change' errors on message edits
                parentCtx.session.lastSentMessage = messageToSend;
            })
    } else {
        parentCtx.reply(`You are not registered as an Admin, this access attempt will be reported.`);
        let warnMessage = `${parentCtx.message.from} used the admin command at: ${new Date().toISOString()}`;
        parentCtx.logger.warn(warnMessage);
        return parentCtx.telegram.sendMessage(warnMessage);
    }
});

adminScene.leave((parentCtx) => {
    let messageToSend = 'ℹ️ You just left the Admin command, all base commands are now available using /menu';
    parentCtx.telegram.editMessageText(parentCtx.chat.id, parentCtx.session.messageToEdit, null, messageToSend);
});

// Listen for an exit callback
adminScene.action('exit', (ctx) => {
    // 'answer' the CB, making the loading icon go away
    ctx.answerCbQuery(ctx.callbackQuery.data);
    return ctx.scene.leave();
});

adminScene.action('procinfo', (ctx) => {
    // 'answer' the CB, making the loading icon go away
    ctx.answerCbQuery(ctx.callbackQuery.data);
    let messageToSend = 'Process Info placeholder';
    if (ctx.session.lastSentMessage !== messageToSend) {
        ctx.session.lastSentMessage = messageToSend;
        return ctx.telegram.editMessageText(ctx.chat.id, ctx.session.messageToEdit, null, messageToSend, adminKeyboard);
    }
});

adminScene.action('logs', (ctx) => {
    // 'answer' the CB, making the loading icon go away
    // we only need WARN and ERROR logs
    ctx.answerCbQuery(ctx.callbackQuery.data);
    let messageToSend = 'Logs placeholder';
    if (ctx.session.lastSentMessage !== messageToSend) {
        ctx.session.lastSentMessage = messageToSend;
        return ctx.telegram.editMessageText(ctx.chat.id, ctx.session.messageToEdit, null, messageToSend, adminKeyboard);
    }
});

adminScene.action('restart', (ctx) => {
    // 'answer' the CB, making the loading icon go away
    ctx.answerCbQuery(ctx.callbackQuery.data);
    let messageToSend = 'Restart placeholder';
    if (ctx.session.lastSentMessage !== messageToSend) {
        ctx.session.lastSentMessage = messageToSend;
        return ctx.telegram.editMessageText(ctx.chat.id, ctx.session.messageToEdit, null, messageToSend, adminKeyboard);
    }
});

adminScene.action('stats', (ctx) => {
    // 'answer' the CB, making the loading icon go away
    ctx.answerCbQuery(ctx.callbackQuery.data);
    let messageToSend = 'Stats placeholder';
    if (ctx.session.lastSentMessage !== messageToSend) {
        ctx.session.lastSentMessage = messageToSend;
        return ctx.telegram.editMessageText(ctx.chat.id, ctx.session.messageToEdit, null, messageToSend, adminKeyboard);
    }
});