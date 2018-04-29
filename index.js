
const express = require('express');
const bodyParser = require('body-parser');
const verification = require('./controllers/verification');
const messageWebhook = require('./controllers/messageWebhook');
const logger = require('morgan');
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(logger('dev'));

app.get('/webhook', verification);
app.post('/webhook', messageWebhook);


const port = parseInt(process.env.PORT, 10) || 30000;
app.listen(port, () => console.log('Webhook server is listening, port 3000'));