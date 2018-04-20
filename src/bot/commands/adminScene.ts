import Stage from 'telegraf/stage';
import Scene from 'telegraf/scenes/base';
import { adminKeyboard } from '../keyboardMarkups';
import { ver, prod, debug, adminID } from '../../config/config';
import os from 'os';
const { enter, leave } = Stage;
const adminScene = new Scene('admin');

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
    let messageToSend = `Bot Version: ${ver}\n\nRAM Total: ${Math.round(os.totalmem() / 1024 / 1024)}MB\nRAM free: ${Math.round(os.freemem() / 1024 / 1024)}MB\nIn use by Bot: ${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB\nCPU load: ${os.loadavg()[0]}%`;
    messageToSend = messageToSend + `\n\nUptime: ${formatTime(process.uptime())}\n\nDebug: ${debug}\nProd: ${prod}`;
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
    // self-restart the bot (another process perhaps?)
    ctx.answerCbQuery(ctx.callbackQuery.data);
    let messageToSend = 'Restart placeholder';
    if (ctx.session.lastSentMessage !== messageToSend) {
        ctx.session.lastSentMessage = messageToSend;
        return ctx.telegram.editMessageText(ctx.chat.id, ctx.session.messageToEdit, null, messageToSend, adminKeyboard);
    }
});

adminScene.action('stats', (ctx) => {
    // 'answer' the CB, making the loading icon go away
    // statistics about the bot, perhaps number of /starts, average response-time, etc.
    ctx.answerCbQuery(ctx.callbackQuery.data);
    let messageToSend = 'Stats placeholder';
    if (ctx.session.lastSentMessage !== messageToSend) {
        ctx.session.lastSentMessage = messageToSend;
        return ctx.telegram.editMessageText(ctx.chat.id, ctx.session.messageToEdit, null, messageToSend, adminKeyboard);
    }
});

// format date from UNIX-Long numbers
function formatTime(seconds: number): string {
    function pad(s) {
        return (s < 10 ? '0' : '') + s;
    }
    var hours = Math.floor(seconds / (60 * 60));
    var minutes = Math.floor(seconds % (60 * 60) / 60);
    var seconds = Math.floor(seconds % 60);
    return pad(hours) + ':' + pad(minutes) + ':' + pad(seconds);
}

export default adminScene;