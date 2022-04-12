const winston = require('winston');
const express = require('express');
const path = require("path");
const app = express();
var http = require('http').createServer(app);

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));


require('./startup/cors')(app);

app.use(`/`, express.static(path.join(__dirname)));

// require('./startup/logging')();

require('./startup/routes')(app);
require('./startup/db')();
require('./startup/config')();
require('./startup/validation')();


const port = process.env.PORT || 3003;
http.listen(port, () => winston.info(`Listening on port ${port}...`));

//S3H9MEUv7b0Nrwx28a