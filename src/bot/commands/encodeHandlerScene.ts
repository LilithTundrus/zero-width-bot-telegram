import * as stringToZeroWidth from '../../lib/stringToZeroWidth';
import Stage from 'telegraf/stage';
import Scene from 'telegraf/scenes/base';
import { encodeKeyboard } from '../keyboardMarkups';

const { enter, leave } = Stage;
const encodeScene = new Scene('encode');

// this is probably the absolute worst way to do this

// on the 'encode' command, a user is brought into a scene to craft a container and message
encodeScene.enter((parentCtx) => {
    return parentCtx.reply('You are in the encode command now! use /back to leave. use /c + message to set container message, use /m + message to set the hideen message. use /done to get your container with the hidden message.', encodeKeyboard)
        .then((ctx) => {
            // get the id of the message sent to later edit after user input is given
            parentCtx.session.messageToEdit = ctx.message_id;
            parentCtx.session.lastSentMessage = 'You are in 🔍 Detect mode now! use /back or the exit button to leave. Send a message or file to be processed.';
        })
})

encodeScene.leave((parentCtx) => {
    parentCtx.telegram.editMessageText(parentCtx.chat.id, parentCtx.session.messageToEdit, null, 'ℹ️ You just left the encode command, all base commands are now available using /menu!')
        .then(() => {
            // Remove the temp var, allow for garbage collection
            return parentCtx.session.messageToEdit = null;
        })
});

encodeScene.command('back', leave());
encodeScene.command('menu', leave());

// Listen for an exit callback
// TODO: DELETE any messages sent using a scene cleanup set of code
encodeScene.action('exit', (ctx) => {
    // 'answer' the CB, making the loading icon go away
    ctx.answerCbQuery(ctx.callbackQuery.data);
    return ctx.scene.leave();
});

encodeScene.action('message', (ctx) => {
    let messageToSend = 'ℹ️ Send a message to encode into your container!';
    // 'answer' the CB, making the loading icon go away
    ctx.answerCbQuery(ctx.callbackQuery.data);
    ctx.session.state = 'message';
    if (ctx.session.lastSentMessage !== messageToSend) {
        ctx.session.lastSentMessage = messageToSend;
        return ctx.telegram.editMessageText(ctx.chat.id, ctx.session.messageToEdit, null, messageToSend, encodeKeyboard);
    }
});

encodeScene.action('container', (ctx) => {
    let messageToSend = 'ℹ️ Send a container to hide your message in!';
    // 'answer' the CB, making the loading icon go away
    ctx.answerCbQuery(ctx.callbackQuery.data);
    ctx.session.state = 'container';
    if (ctx.session.lastSentMessage !== messageToSend) {
        ctx.session.lastSentMessage = messageToSend;
        return ctx.telegram.editMessageText(ctx.chat.id, ctx.session.messageToEdit, null, messageToSend, encodeKeyboard);
    }
});

encodeScene.action('done', (ctx) => {
    let messageToSend = '🕑 Creating your encoded message....';
    if (ctx.session.message == undefined && ctx.session.container == undefined) messageToSend = `⛔️ You must first set a ✉️ Message and a 📁 Container`;
    else if (ctx.session.container == undefined) messageToSend = `⛔️ You are missing a 📁 Container`;
    else if (ctx.session.message == undefined) messageToSend = `⛔️ You are missing a ✉️ Message`;
    else {
        messageToSend = `✅ Below is your encoded message!`;
        // send the user their message
    }
    // 'answer' the CB, making the loading icon go away
    ctx.answerCbQuery(ctx.callbackQuery.data);
    if (ctx.session.lastSentMessage !== messageToSend) {
        ctx.session.lastSentMessage = messageToSend;
        return ctx.telegram.editMessageText(ctx.chat.id, ctx.session.messageToEdit, null, messageToSend, encodeKeyboard).
            then(() => {
                if (ctx.session.message !== undefined && ctx.session.container !== undefined) {
                    return ctx.reply(`${ctx.session.container}${stringToZeroWidth.default(ctx.session.message)}`);
                }
            })
    }
});


// on text, attempt an encode action from session or scene change
encodeScene.on('text', (ctx) => {
    let userMessage = ctx.message.text.trim();
    // if text is a command like 💊 Clean, go to that scene!!
    // TODO: Do this for all base commands
    if (userMessage == '💊 Clean') {
        // leave the scene and enter the next
        return ctx.scene.leave().then(() => {
            return ctx.scene.enter('clean');
        });
    } else if (userMessage == '✉️ Encode') {
        // Doesn't work more than once annoyingly
        let messageToSend = 'ℹ️ You are already in the ✉️ Encode command!';
        if (ctx.session.lastSentMessage !== messageToSend) {
            ctx.session.lastSentMessage = messageToSend;
            return ctx.telegram.editMessageText(ctx.chat.id, ctx.session.messageToEdit, null, messageToSend, encodeKeyboard);
        }
    } else if (userMessage == '📨 Decode') {
        return ctx.scene.leave().then(() => {
            return ctx.scene.enter('decode');
        });
    } else if (userMessage == '🔍 Detect') {
        return ctx.scene.leave().then(() => {
            return ctx.scene.enter('detect');
        });
    }
    // check the session state to figure out what to assign the text to
    if (ctx.session.state == 'message') {
        console.log(ctx.session.state)
        // the text they sent will be the message to encode
        ctx.session.message = ctx.message.text;
    } else if (ctx.session.state == 'container') {
        console.log(ctx.session.state)
        // the text they sent will be the message to encode
        ctx.session.container = ctx.message.text;
    }
});

export default encodeScene;