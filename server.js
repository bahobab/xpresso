const express = require('express');
const sqlite3 = require('sqlite3');
const cors = require('cors');
const bodyParser = require('bodyParser');
const morgan = require('morgan');
const errorHandler = require('errorhandler');

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use(morgan('dev'));
app.use(errorHandler());


const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite', (err) => {
    if (err) {
        console.log('Error creating/connecting to database', err);
    } else {
        console.log('Connected to database');
    }
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Server listening to port ${PORT}`);
})