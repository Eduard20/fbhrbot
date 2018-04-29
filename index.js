'use strict';
const BootBot = require('bootbot');

const bot = new BootBot({
    accessToken: process.env['FB_ACCESS_TOKEN'],
    verifyToken: process.env['FB_VERIFY_TOKEN'],
    appSecret: process.env['FB_APP_SECRET']
});
bot.on('message', (payload, chat) => {
    console.log(payload, chat);
    const text = payload.message.text;
    chat.say(`Echo: ${text}`);
});

bot.start(parseInt(process.env.PORT, 10) || 3000);