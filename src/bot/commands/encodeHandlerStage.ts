import Stage from 'telegraf/stage';
import Scene from 'telegraf/scenes/base';

// on the 'encode' command, a user is brought into a scene to craft a container and message
const { enter, leave } = Stage;
const encodeScene = new Scene('encode');

// this is probably the absolute worst way to do this

let tempUserDataArray = [];

encodeScene.enter((ctx) => {
    tempUserDataArray.push(generateTempObj(ctx.message.from.id));
    // we may need to create a local object here if we're storing any amount of temporary user data
    console.log(ctx.chat)
    return ctx.reply('You are in the decode scene now! use /back to leave. use /c to set container message, use /m to set the hideen message');
    // send the text markup
    // maybe we run a .next chain?
})

encodeScene.leave((ctx) => {
    removeTempUser(ctx.chat.id);
    return ctx.reply('You just left the encode scene, all base commands are now available!');
});

// TODO: if any base commands are given, let the user know they're not in the base scene!
encodeScene.command('back', leave());

encodeScene.command('c', (ctx) => {
    console.log(ctx.chat);
    let container = ctx.message.text.substring(3).trim();
    console.log(container);
    if (container.length < 1) {
        return ctx.reply('please give a message to be a container for the secret message!');
    }
    setUserContainer(container, ctx.message.from.id);
    // assign the temp variable for the message

})


function generateTempObj(teleID) {
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
            console.log(userData)
        }
    }
}

function removeTempUser(teleID) {

}

export default encodeScene;