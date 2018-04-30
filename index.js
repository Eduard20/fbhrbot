'use strict';
const BootBot = require('bootbot');
const texts = require('./texts/common')

const bot = new BootBot({
    accessToken: process.env['FB_ACCESS_TOKEN'],
    verifyToken: process.env['FB_VERIFY_TOKEN'],
    appSecret: process.env['FB_APP_SECRET']
});

bot.setGetStartedButton((payload, chat) => {
  const options = { typing: true };
  chat.say({
	text: texts.activation,
	quickReplies: ['/start']
  }, options);
});

bot.hear('/start',(payload,chat) => {
  chat.say({
    text:'hellloooo',
    quickReplies:[{
      "content_type":"text",
      "title":"/start",
      "payload":"<POSTBACK_PAYLOAD>",
      "image_url":"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ02OVEsIlkuaHdGRZD56bchujOeYJNfzTyVLJwihOmfFdEcYW4"
    }]
  });
});

bot.start(parseInt(process.env.PORT, 10) || 3000);
