const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const logger = require('morgan');
require('dotenv').config()

const app = express();

var corsOptions = {
    origin : "*"
}
app.use(cors(corsOptions));


// connects our back end code with the database
mongoose.connect(process.env.DB_ROUTE, { useNewUrlParser: true, useUnifiedTopology: true });

let db = mongoose.connection;

db.once('open', () => console.log('Connected to the database'));

// checks if connection with the database is successful
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

if (process.env.NODE_ENV === 'development') {
    // (optional) only made for logging and
    // bodyParser, parses the request body to be a readable json format
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use(logger('dev'));
}

const request = require("./request/request.js");
// append /api for our http requests
app.use('/api', request);
// launch our backend into a port
var server = app.listen(3001, () => console.log("Server running on port "+3001));

const {initSocket} = require('./socket/initSocket');

initSocket(server);

const {initData} = require("./utils/game.js");

initData();

