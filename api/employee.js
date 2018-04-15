const express = require('express');
const employeeRouter = express.Router();
const sqlite3 = require('sqlite3');

const dbUtils = require('./dbUtils');

const timesheetRouter = require('./timesheet');
employeeRouter.use('/:employeeId/timesheets', timesheetRouter);


const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite', (err) => {
    if (err) {
        console.log('Error connecting to database...');
    } else {
        console.log('Successfully connected to in-memory database - Employee');
    }
});

dbUtils.getAll(employeeRouter, '/', 'employees', 'Employee', 'is_current_employee', 1);

dbUtils.routerParam(employeeRouter, 'Employee', 'employee');

employeeRouter.get('/:id', (req, res,next) => {
    res.status(200).json({employee:req.employee})
});

employeeRouter.post('/', (req, res, next) => {
    const newEmployee = req.body.employee;
    const {name, position, wage} = newEmployee;

    if (!dbUtils.isValid(name, position, wage)) {
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

employeeRouter.put('/:id', (req, res, next) => {
    const newEmployee = req.body.employee;
    const employeeId = Number(req.params.id);
    const {name, position, wage} = newEmployee;

    if (!dbUtils.isValid(name, position, wage)) {
        res.sendStatus(400);
        return;
    }

    const query = `UPDATE Employee
                        SET 
                            name=$name,
                            position=$position,
                            wage=$wage
                                WHERE
                                    id=$id;`;
    const values = {
        $id: employeeId,
        $name: newEmployee.name,
        $position: newEmployee.position,
        $wage: newEmployee.wage
    };

    dbUtils.updateOne('employee', 'Employee', 'id', query, values, res, next);
});

employeeRouter.delete('/:id', (req, res, next) => {
    const employeeId = Number(req.params.id);
    const query = `UPDATE Employee
                        SET 
                        is_current_employee=$ice
                                WHERE
                                    id=$id;`;
    const values = {
        $id: employeeId,
        $ice: 0
    };

    dbUtils.updateOne('employee', 'Employee', 'id', query, values, res, next);
});

module.exports = employeeRouter;