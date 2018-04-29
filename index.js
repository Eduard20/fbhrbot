
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
    accessToken: 'EAAFjzqFYDZAwBACCCbL3r9nd94XZCzBfMyZCvkOLjOTi77hpdVsL8p89dAax27RUT8JlzEEVEiCbCRg2HpGlUnv9wjsy7irqRqZBiZCzTw2rQi2sGBEoPLJSGniIdicVZCgm8mpo20bg8iZC7JpCWZCZC5RV1ZBYaQeMfd0Dlz5Td05QqVVFg0eCtj',
    verifyToken: 'hrbot',
    appSecret: '041a590e2707c4c0f5c0c210ebb96049'
});
bot.on('message', (payload, chat) => {
    console.log(payload, chat);
    const text = payload.message.text;
    chat.say(`Echo: ${text}`);
});

bot.start(parseInt(process.env.PORT, 10) || 3000);