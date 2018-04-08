import Stage from 'telegraf/stage';
import Scene from 'telegraf/scenes/base';

// on the 'encode' command, a user is brought into a scene to craft a container and message
const { enter, leave } = Stage;
const encodeScene = new Scene('encode');

encodeScene.enter((ctx) => {
    console.log(ctx.chat.id)
    // we may need to create a local object here if we're storing any amount of temporary user data
    return ctx.reply('You are in the decode scene now! use /back to leave. use /c to set container message, use /m to set the hideen message');
    // send the text markup
});

encodeScene.leave((ctx) => {
    return ctx.reply('You just left the encode scene, all base commands are available')

});
encodeScene.command('back', leave());

encodeScene.hears('/c', (ctx) => {
    console.log(ctx.message.text.substring(3).trim())
})

export default encodeScene;


