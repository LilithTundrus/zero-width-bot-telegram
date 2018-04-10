import * as stringToZeroWidth from '../../lib/stringToZeroWidth';
import Stage from 'telegraf/stage';
import Scene from 'telegraf/scenes/base';
import { messageKeyboard } from '../keyboardMarkups';

const { enter, leave } = Stage;
const encodeScene = new Scene('encode');

// this is probably the absolute worst way to do this
let tempUserDataArray = [];

// on the 'encode' command, a user is brought into a scene to craft a container and message
encodeScene.enter((ctx) => {
    // generate an object per user call 
    tempUserDataArray.push(createTemUser(ctx.message.from.id));
    return ctx.reply('You are in the encode command now! use /back to leave. use /c + message to set container message, use /m + message to set the hideen message. use /done to get your container with the hidden message.', messageKeyboard);
    // send the keyboard markup
})

encodeScene.leave((ctx) => {
    removeTempUser(ctx.chat.id);
    return ctx.reply('You just left the encode command, all base commands are now available!');
});

// TODO: if any base commands are given, let the user know they're not in the base scene!
// TODO: at the end of /c and /m, check if the user has both data points and send the 
// message without the need for /done to be used
// TODO: Use fancy buttons/icons instead of commands
// TODO: We want this to also accept files when a button is pressed
encodeScene.command('back', leave());

encodeScene.command('c', (ctx) => {
    let container = ctx.message.text.substring(3).trim();
    if (container.length < 1) {
        return ctx.reply('please give a message to be a container for the secret message!');
    }
    // assign the temp variable for the message
    return setUserContainer(container, ctx.message.from.id);
})

encodeScene.command('m', (ctx) => {
    let message = ctx.message.text.substring(3).trim();
    if (message.length < 1) {
        return ctx.reply('please give a message to encode into the container!');
    }
    // assign the temp variable for the message
    return setUserMessage(message, ctx.message.from.id);
})

encodeScene.command('done', (ctx) => {
    // get the user's temp message and data
    let userData = getUserData(ctx.chat.id)
    if (userData.container.length > 1 && userData.container.length > 1) {
        let zeroWidthString = stringToZeroWidth.default(userData.message);
        ctx.reply('Got it, your message is below:');
        return ctx.reply(`${userData.container}${zeroWidthString}`);
    } else {
        return ctx.reply('Please make sure you have set a container and message using the /c and /m command');
    }
})

// This is listening for the callback buttons
encodeScene.action('exit', (ctx) => {
    console.log(ctx.callbackQuery)
    // 'answer' the CB, making the loading icon go away
    ctx.answerCbQuery(ctx.callbackQuery.data)
    ctx.scene.leave();
});

encodeScene.action('message', (ctx) => {
    ctx.answerCbQuery(ctx.callbackQuery.data)
    ctx.reply('Enter the message you want Hidden in your container')
    // get input from the user
})
// CRUD functions for temporary user objects
// TODO make this an interface to we can correctly describe the object, even if it's temp stuff
function createTemUser(teleID: string) {
    let tempUserDataObj = {
        container: '',
        message: '',
        teleID: teleID
    };
    return tempUserDataObj;
}

function setUserContainer(container: string, teleID: string) {
    for (let userData of tempUserDataArray) {
        if (userData.teleID == teleID) {
            userData.container = container;
        }
    }
}

function setUserMessage(message: string, teleID: string) {
    for (let userData of tempUserDataArray) {
        if (userData.teleID == teleID) {
            userData.message = message;
        }
    }
}

function getUserData(teleID: string) {
    for (let userData of tempUserDataArray) {
        if (userData.teleID == teleID) {
            return userData;
        }
    }
}

function removeTempUser(teleID: string) {
    // reverse lookup to prevent array corruption/mistmatching
    for (var i = tempUserDataArray.length - 1; i >= 0; --i) {
        if (tempUserDataArray[i].teleID == teleID) {
            tempUserDataArray.splice(i, 1);
            console.log(`Removed user ${teleID} from the temp array`);
        }
    }
}

export default encodeScene;