const express = require('express');
const employeeRouter = express.Router();

const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite', (err) => {
    if (err) {
        console.log('Error connecting to database...');
    } else {
        console.log('Successfully connected to in-memory database');
    }
});



module.exports = employeeRouter;