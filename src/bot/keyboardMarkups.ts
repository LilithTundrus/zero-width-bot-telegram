const Extra = require('telegraf/extra');
const Markup = require('telegraf/markup')


const encodeKeyboard = Extra.HTML().markup((m) =>
    m.inlineKeyboard([
        m.callbackButton('✉️ Set Message', 'message'),
        m.callbackButton('📁 Set Container', 'container'),
        m.callbackButton('📄 Encode File', 'file'),
        m.callbackButton('✅ Create', 'done'),
        m.callbackButton('❌ Exit', 'exit')],
        { columns: 2 }));


const mainMenuKeyboard = Markup.keyboard([
    ['🔍 Detect', '💊 Clean'],
    ['✉️ Encode', '📨 Decode'],
]).resize().extra();


const detectKeyboard = Extra.HTML()
    .markup((m) =>
        m.inlineKeyboard([
            m.callbackButton('✉️ Detect From Message', 'message'),
            m.callbackButton('📄 Detect From File', 'file'),
            m.callbackButton('❌ Exit', 'exit')],
            { columns: 2 })
    );

const decodeKeyboard = Extra.HTML()
.markup((m) =>
    m.inlineKeyboard([
        m.callbackButton('✉️ Deocde From Message', 'message'),
        m.callbackButton('📄 Deocde From File', 'file'),
        m.callbackButton('❌ Exit', 'exit')],
        { columns: 2 })
);

const adminKeyboard = Extra.HTML()
.markup((m) =>
    m.inlineKeyboard([
        m.callbackButton('ℹ️ Process Info', 'procinfo'),
        m.callbackButton('🗒 Logs', 'logs'),
        m.callbackButton('🔅 Restart bot', 'restart'),
        m.callbackButton('📈 Stats', 'stats'),
        m.callbackButton('❌ Exit', 'exit')
    ],
        { columns: 2 })
);

export { encodeKeyboard, mainMenuKeyboard, detectKeyboard, decodeKeyboard }