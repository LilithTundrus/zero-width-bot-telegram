const Extra = require('telegraf/extra');


const messageKeyboard = Extra.HTML().markup((m) =>
    m.inlineKeyboard([
        m.callbackButton('✉️ Set Message', 'message'),
        m.callbackButton('📁 Set Container', 'container'),
        m.callbackButton('📄 Encode File', 'file'),
        m.callbackButton('✅ Create', 'done'),
        m.callbackButton('❌ Exit', 'exit')
    ], { columns: 2 }
    ));

export { messageKeyboard }