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
	quickReplies: ['Red', 'Blue', 'Green']
  }, options).then(() => chat.say({
	text: 'Favorite color?',
	buttons: [
		{ type: 'postback', title: 'Red', payload: 'FAVORITE_RED' },
		{ type: 'postback', title: 'Blue', payload: 'FAVORITE_BLUE' },
		{ type: 'postback', title: 'Green', payload: 'FAVORITE_GREEN' }
	]
  }, options));
});
bot.start(parseInt(process.env.PORT, 10) || 3000);
