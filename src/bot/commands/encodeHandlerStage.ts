import Stage from 'telegraf/stage';
import Scene from 'telegraf/scenes/base';

// on the 'encode' command, a user is brought into a scene to craft a container and message
const { enter, leave } = Stage;
const encodeScene = new Scene('encode');

encodeScene.enter((ctx) => {
    return ctx.reply('You are in the decode scene now! use /back to leave');
});

encodeScene.leave((ctx) => {
    return ctx.reply('You just left the encode scene, all base commands are available')

});
encodeScene.command('back', leave());


export default encodeScene;


