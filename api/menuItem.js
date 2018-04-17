const express = require('express');
const sqlite3 = require('sqlite3');

const menuitemRouter = express.Router({mergeParams: true});

const dbUtils = require('./dbUtils');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite',
        err => {
            if (err) {
                console.log('Error connecting to MenuItem');
            } else {
                console.log('Successfully connected to in-memory database - MenuItem...');
            }
});


module.exports = menuitemRouter;