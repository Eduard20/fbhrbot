
const express = require('express');
const bodyParser = require('body-parser');
const verification = require('./controllers/verification');
const messageWebhook = require('./controllers/messageWebhook');
require('./bot');
const logger = require('morgan');
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(logger('dev'));

app.get('/', verification);
app.post('/', messageWebhook);


const port = parseInt(process.env.PORT, 10) || 30000;
app.listen(port, () => console.log('Webhook server is listening, port 3000'));