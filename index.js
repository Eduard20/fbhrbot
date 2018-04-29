
// const express = require('express');
// const bodyParser = require('body-parser');
// const verification = require('./controllers/verification');
// const messageWebhook = require('./controllers/messageWebhook');
// const logger = require('morgan');
// const app = express();
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(logger('dev'));
//
// app.get('/webhook', verification);
// app.post('/webhook', messageWebhook);
//
//
// const port = parseInt(process.env.PORT, 10) || 30000;
// app.listen(port, () => console.log('Webhook server is listening, port 3000'));

'use strict';
const BootBot = require('bootbot');

const bot = new BootBot({
    accessToken: 'EAAMekGZAoKGEBALqPDjJjhgolT09YEPwmoSDe3pRH8RR4ZCaq9aGE0ZBgOffEW0KQXdN4DM9m6FCTR1ZADyGcSGYDZBSakurhlZCZB8fBah6DIXH7s8RM4nWfWVZCnI5RENQBkeX7bqKitGNE5xAyYFDOdX9YD9yzQ1CnEHuuc2kZB8CxSASrIbla',
    verifyToken: 'hrbot',
    appSecret: '5dde2b5ba220f918a3e6be66c4d79a6a'
});
bot.on('message', (payload, chat) => {
    console.log(payload, chat);
    const text = payload.message.text;
    chat.say(`Echo: ${text}`);
});

bot.start(parseInt(process.env.PORT, 10) || 3000);