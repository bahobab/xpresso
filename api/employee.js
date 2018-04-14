const express = require('express');
const employeeRouter = express.Router();

const dbUtils = require('./dbUtils');

const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite', (err) => {
    if (err) {
        console.log('Error connecting to database...');
    } else {
        console.log('Successfully connected to in-memory database');
    }
});

employeeRouter.get('/', (req, res, next) => {
    const query = 'SELECT * FROM Employee WHERE is_current_employee='+1+';';
    dbUtils.getAll('employees', query, req, res, next);

});

module.exports = employeeRouter;