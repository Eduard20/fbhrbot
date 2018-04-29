
const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan')
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(logger('dev'));

app.get('/', (req, res) => {
    res.send('1861186213');
});

const port = parseInt(process.env.PORT, 10) || 3000;
app.listen(port, () => console.log('Webhook server is listening, port 3000'));