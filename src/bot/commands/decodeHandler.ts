'use strict';
import * as zeroWidthToString from '../../lib/zeroWidthToUsername';

// handle /encode command calls
export default async function startHandler(ctx) {
    ctx.resetTimer();
    ctx.time('Got decode message...');
    ctx.logger.info(`encode from ${JSON.stringify(ctx.message.from)}`)
    let stringFromZeroWidth = zeroWidthToString.default('This contains your message ‌﻿​﻿​﻿​﻿‌﻿‌﻿​﻿​﻿‍﻿‌﻿​﻿​﻿‌﻿​﻿‌﻿‌﻿​﻿‍﻿‌﻿​﻿​﻿‌﻿​﻿​﻿‌﻿​﻿‍﻿‌﻿​﻿​﻿​﻿‌﻿‌﻿‌﻿‌﻿‍﻿‌﻿​﻿​﻿‌﻿​﻿​﻿‌﻿‌﻿‍﻿‌﻿​﻿​﻿‌﻿‌﻿​﻿‌﻿​﻿‍﻿‌﻿​﻿‌﻿​﻿​﻿​﻿​﻿​﻿‍﻿‌﻿​﻿​﻿​﻿‌﻿​﻿‌﻿‌﻿‍﻿‌﻿​﻿​﻿‌﻿‌﻿​﻿‌﻿​﻿‍﻿‌﻿​﻿​﻿​﻿‌﻿‌﻿​﻿​﻿‍﻿‌﻿​﻿​﻿​﻿‌﻿​﻿‌﻿‌')
    // console.log(`This contains your message ${zeroWidthString}`)
    return ctx.reply(`This contains your message ${stringFromZeroWidth}`)
        .then(() => ctx.time('reply message sent!'));
}
