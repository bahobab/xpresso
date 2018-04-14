const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const errorHandler = require('errorhandler');

const app = express();

const apiRouter = require('./api/api');

app.use(cors());
app.use(bodyParser.json());
app.use('/api', apiRouter);
app.use(morgan('dev'));
app.use(errorHandler());

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Server listening to port ${PORT}`);
})

module.exports = app;