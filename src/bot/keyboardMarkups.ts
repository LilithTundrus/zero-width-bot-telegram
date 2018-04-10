const Extra = require('telegraf/extra');


const messageKeyboard = Extra.HTML().markup((m) =>
    m.inlineKeyboard([
        m.callbackButton('✉️ Message', 'message'),
        m.callbackButton('📁 Container', 'container'),
        m.callbackButton('✅ Create', 'done'),
        m.callbackButton('❌ Exit', 'exit')
    ]
    ));

export { messageKeyboard }