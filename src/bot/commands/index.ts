'use strict';
import Composer from 'telegraf';
import Stage from 'telegraf/stage';
import Scene from 'telegraf/scenes/base';
// Our custom imports to attach to the composer for telegram command handling
import startHandler from './startHandler';
import menuHandler from './menuHandler';

import processinfoHandler from './processInfoHandler';
import encodeHandler from './encodeHandler';
import decodeHandler from './decodeHandler';
import detectHandler from './detectHandler';

// Scenes (will be replacing basic commands above)
import encodeScene from './encodeHandlerScene';
import detectScene from './detectHandlerScene';

// Literally set the stages for the composer to user as middleware for certain commands
const stage = new Stage([encodeScene, detectScene]);
const { enter, leave } = Stage;

const composer = new Composer();

composer.use(
    stage.middleware(),
)

composer.command('start', startHandler);
composer.command('menu', menuHandler);
composer.command('procinfo', processinfoHandler);
composer.command('encode', encodeHandler);
composer.command('decode', decodeHandler);
composer.command('encodenew', enter('encode'));
composer.command('detect', enter('detect'));


// listen for specific commands from the main menu
composer.hears('🔍 Detect', enter('detect'));

export = composer;
