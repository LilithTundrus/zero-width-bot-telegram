import * as stringToZeroWidth from '../../lib/stringToZeroWidth';
import Stage from 'telegraf/stage';
import Scene from 'telegraf/scenes/base';
import { adminID } from '../../config/config';
import { encodeKeyboard } from '../keyboardMarkups';
import { isNullOrUndefined } from 'util';
import { requestUrl } from '../../lib/request';
import * as fs from 'fs';

// TODO: Figure out why the missing container message can sometimes appear when the container is NOT missing

const { enter, leave } = Stage;
const encodeScene = new Scene('encode');

// on the 'encode' command, a user is brought into a scene to craft a container and message
encodeScene.enter((parentCtx) => {
    return parentCtx.reply('You are in ✉️ Encode mode now! use /back or the exit button to leave. Send a message or file to be processed.', encodeKeyboard)
        .then((ctx) => {
            // get the id of the message sent to later edit after user input is given
            parentCtx.session.messageToEdit = ctx.message_id;
            parentCtx.session.lastSentMessage = 'You are in ✉️ Encode mode now! use /back or the exit button to leave. Send a message or file to be processed.';
        })
})

encodeScene.leave((parentCtx) => {
    parentCtx.telegram.editMessageText(parentCtx.chat.id, parentCtx.session.messageToEdit, null, 'ℹ️ You just left the encode command, all base commands are now available using /menu!')
        .then(() => {
            // check if they have a temp file
            if (fs.existsSync(`../temp/target${parentCtx.chat.id}.txt`)) {
                fs.unlink(`../temp/target${parentCtx.chat.id}.txt`, function (error) {
                    if (error) {
                        throw error;
                    }
                    console.log('Deleted user temp file');
                });
            }
            // Remove the temp vars, allow for garbage collection
            parentCtx.session.container = null;
            parentCtx.session.message = null;
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
    else if (!ctx.session.container) messageToSend = `⛔️ You are missing a 📁 Container`;
    else if (!ctx.session.message) messageToSend = `⛔️ You are missing a ✉️ Message`;
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
                if (ctx.session.message && ctx.session.container) {
                    return ctx.reply(`${ctx.session.container}${stringToZeroWidth.default(ctx.session.message)}`);
                }
            })
    }
});

encodeScene.action('file', (ctx) => {
    let messageToSend = 'ℹ️ Send a file to check encode!';
    // 'answer' the CB, making the loading icon go away
    ctx.answerCbQuery(ctx.callbackQuery.data);
    if (ctx.session.lastSentMessage !== messageToSend) {
        ctx.session.lastSentMessage = messageToSend;
        return ctx.telegram.editMessageText(ctx.chat.id, ctx.session.messageToEdit, null, messageToSend, encodeKeyboard);
    }
});

// on text, attempt an encode action from session or scene change
encodeScene.on('text', (ctx) => {
    let userMessage = ctx.message.text.trim();
    // if text is a command, go to that scene!!
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
        // the text they sent will be the message to encode
        ctx.session.message = ctx.message.text;
    } else if (ctx.session.state == 'container') {
        // the text they sent will be the container
        ctx.session.container = ctx.message.text;
    }
});

encodeScene.on('document', (ctx) => {
    if (!ctx.session.message) {
        let messageToSend = `⛔️ You need to set a ✉️ Message to encode into the document!`;
        if (ctx.session.lastSentMessage !== messageToSend) {
            ctx.session.lastSentMessage = messageToSend;
            return ctx.telegram.editMessageText(ctx.chat.id, ctx.session.messageToEdit, null, messageToSend, encodeKeyboard);
        }
    }
    if (ctx.message.document.file_name.includes('.txt') && ctx.message.document.mime_type == 'text/plain') {
        // TODO: record the filename to a var to user later down below!!!
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
                        // get the file, find a space, append the zero-width message there, if no spaces just append the zero-width message
                        return fs.writeFile(`../temp/target${ctx.chat.id}.txt`, `${results}${stringToZeroWidth.default(ctx.session.message)}`, (err) => {
                            if (err) {
                                throw err;
                            }
                            console.log('File saved!');
                        });
                    })
                    .then(() => {
                        // reset the message and send the document
                        ctx.replyWithDocument({
                            source: fs.createReadStream(`../temp/target${ctx.chat.id}.txt`),
                            filename: `target${ctx.chat.id}.txt`
                        })
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
            return ctx.telegram.editMessageText(ctx.chat.id, ctx.session.messageToEdit, null, messageToSend, encodeKeyboard);
        }
    } else {
        let messageToSend = `⛔️ Please send a file in .txt format`;
        if (ctx.session.lastSentMessage !== messageToSend) {
            ctx.session.lastSentMessage = messageToSend;
            return ctx.telegram.editMessageText(ctx.chat.id, ctx.session.messageToEdit, null, messageToSend, encodeKeyboard);
        }
    }
});

export default encodeScene;