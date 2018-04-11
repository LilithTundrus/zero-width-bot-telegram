const Extra = require('telegraf/extra');
const Markup = require('telegraf/markup')


const messageKeyboard = Extra.HTML().markup((m) =>
    m.inlineKeyboard([
        m.callbackButton('✉️ Set Message', 'message'),
        m.callbackButton('📁 Set Container', 'container'),
        m.callbackButton('📄 Encode File', 'file'),
        m.callbackButton('✅ Create', 'done'),
        m.callbackButton('❌ Exit', 'exit')
    ], { columns: 2 }
    ));

const mainMenuKeyboard = Markup.keyboard([
    ['🔍 Detect'],
    ['✉️ Encode', '📨 Decode'],
]).resize().extra();



export { messageKeyboard, mainMenuKeyboard }