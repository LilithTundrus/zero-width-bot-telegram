'use strict';
import Composer from 'telegraf';
import startHandler from './startHandler';
import processInfHandler from './processInfoHandler';

const composer = new Composer();

composer.command('start', startHandler);
composer.command('procinfo', processInfHandler);

export = composer;
