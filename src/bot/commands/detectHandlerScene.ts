'use strict';
import * as zeroWidthToString from '../../lib/zeroWidthToString';

import Stage from 'telegraf/stage';
import Scene from 'telegraf/scenes/base';
import { detectKeyboard } from '../keyboardMarkups';

const { enter, leave } = Stage;
const detectScene = new Scene('detect');


// on enter, give a couple options and an explanation
detectScene.enter((ctx) => {
    // generate an object per user call 
    return ctx.reply('You are in detect mode now! use /back to leave, select an option to get started.', detectKeyboard)
        .then((ctx) => {
            // get the id of the message sent to later edit after user input is given
        })
    // send the keyboard markup
})

// on text, attempt a detect

// on document, check file type and attempt a detect

export default detectScene;