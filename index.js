
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('hello');
});

const port = parseInt(process.env.PORT, 10) || 3000;
app.listen(port, () => console.log('Webhook server is listening, port 3000'));