const express = require('express');
const sqlite3 = require('sqlite3');

const menuRouter = express.Router();
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite',
            (err) => {
                if (err) {
                    console.log('Error connecting/opening database Menu...', err);
                } else {
                    console.log('Successfully conected to in-memory database - Menu...')
                }
            });



module.exports = menuRouter;