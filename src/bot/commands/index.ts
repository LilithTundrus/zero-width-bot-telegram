'use strict';
import Composer from 'telegraf';
import Stage from 'telegraf/stage';
import Scene from 'telegraf/scenes/base';
// Our custom imports to attach to the composer for telegram command handling
import startHandler from './startHandler';
import menuHandler from './menuHandler';

import processinfoHandler from './processInfoHandler';

// Scenes (will be replacing basic commands above)
import encodeScene from './encodeHandlerScene';
import detectScene from './detectHandlerScene';
import decodeScene from './decodeHandlerScene';

// Literally set the stages for the composer to user as middleware for certain commands
const stage = new Stage([encodeScene, detectScene, decodeScene]);
const { enter, leave } = Stage;

const composer = new Composer();

composer.use(
    stage.middleware(),
)

composer.command('start', startHandler);
composer.command('menu', menuHandler);
composer.command('procinfo', processinfoHandler);
composer.command('decode', enter('decode'));
composer.command('encode', enter('encode'));
composer.command('detect', enter('detect'));


// listen for specific commands from the main menu
composer.hears('🔍 Detect', enter('detect'));
composer.hears('✉️ Encode', enter('encode'));
composer.hears('📨 Decode', enter('decode'));

export = composer;
