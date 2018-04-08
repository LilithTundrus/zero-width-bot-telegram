'use strict';
import Composer from 'telegraf';
import startHandler from './startHandler';
import processInfHandler from './processInfoHandler';
import encodeHandler from './encodeHandler';
import decodeHandler from './decodeHandler';

const composer = new Composer();

composer.command('start', startHandler);
composer.command('procinfo', processInfHandler);
composer.command('encode', encodeHandler);
composer.command('decode', decodeHandler);



export = composer;
