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

dbUtils.getAll(employeeRouter, '/', 'employees', 'Employee', 'is_current_employee', 1);

dbUtils.routerParam(employeeRouter, 'Employee', 'employee');

employeeRouter.get('/:id', (req, res,next) => {
    res.status(200).json({employee:req.employee})
});

employeeRouter.post('/', (req, res, next) => {
    // console.log('>>>', req.body);
    const newEmployee = req.body.employee;
    const {name, position, wage} = newEmployee;
    if (!(name && position && wage)) {
        res.sendStatus(400);
        return;
    }
    const query = `INSERT INTO Employee
                        (name, position, wage, is_current_employee)
                            VALUES
                                ($name, $position, $wage, $ice);`;
    const values = {
        $name: newEmployee.name,
        $position: newEmployee.position,
        $wage: newEmployee.wage,
        $ice: 1
    };

    dbUtils.insertOne('employee', 'Employee', query, values, res, next);

});


module.exports = employeeRouter;