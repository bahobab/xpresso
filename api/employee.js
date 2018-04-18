const express = require('express');
const employeeRouter = express.Router();
const sqlite3 = require('sqlite3');

const dbUtils = require('./dbUtils');

const timesheetRouter = require('./timesheet');
employeeRouter.use('/:employeeId/timesheets', timesheetRouter);

employeeRouter.get('/', async (req,res, next) => {
    const query = `SELECT *
                    FROM
                        Employee
                    WHERE
                        is_current_employee=1;`;

    const selectAll = await dbUtils.getAll(query);
    if (selectAll.err) {
        next(selectAll.err);
    } else {
        res.status(200).json({employees:selectAll.data});        
    }
});

dbUtils.routerParam(employeeRouter, 'Employee', 'employee');

employeeRouter.get('/:id', (req, res,next) => {
    res.status(200).json({employee:req.employee})
});

employeeRouter.post('/', async (req, res, next) => {
    const newEmployee = req.body.employee;
    const {name, position, wage} = newEmployee;

    if (!dbUtils.isValid(name, position, wage)) {
        res.sendStatus(400);
        return;
    }

    const query = `INSERT 
                    INTO Employee
                        (name, position, wage, is_current_employee)
                    VALUES
                        ($name, $position, $wage, $ice);`;
    
    const values = {
        $name: newEmployee.name,
        $position: newEmployee.position,
        $wage: newEmployee.wage,
        $ice: 1
    };

    const postResults = await dbUtils.insertOne(query, values);
    if (postResults.err) {
        next(postResults.err);
    } else {
        const selectResults = await dbUtils.selectOne('Employee', 'id', postResults.lastID);
        if (selectResults.err) {
            next(selectResults.err);
        } else {
            res.status(201).json({employee:selectResults.data});
        }
    }

});

employeeRouter.put('/:id', async (req, res, next) => {
    const newEmployee = req.body.employee;
    const employeeId = Number(req.params.id);
    const {name, position, wage} = newEmployee;

    if (!dbUtils.isValid(name, position, wage)) {
        res.sendStatus(400);
        return;
    }

    const query = `UPDATE
                        Employee
                    SET 
                        name=$name,
                        position=$position,
                        wage=$wage,
                        is_current_employee=$ice
                    WHERE
                        id=$id;`;

    const values = {
        $id: employeeId,
        $name: newEmployee.name,
        $position: newEmployee.position,
        $wage: newEmployee.wage,
        $ice: 1
    };

    const updateResults = await dbUtils.updateOne(query, values);
    if (updateResults.err) {
        next(updateResults.err);
    } else {
        const selectResults = await dbUtils.selectOne('Employee', 'id', employeeId);
        if (selectResults.err) {
            next(selectResults.err);
        } else {
            res.status(200).json({employee:selectResults.data});
        }
    }
});

employeeRouter.delete('/:id', async (req, res, next) => {
    const employeeId = Number(req.params.id);
    const query =   `UPDATE
                        Employee
                    SET 
                        is_current_employee=$ice
                    WHERE
                        id=$id;`;

    const values = {
        $id: employeeId,
        $ice: 0
    };
    const updateResults = await dbUtils.updateOne(query, values);
    if (updateResults.err) {
        next(updateResults.err);
    } else {
        const selectResults = await dbUtils.selectOne('Employee', 'id', employeeId);                
        if (selectResults.err) {
            next(selectResults.err);
        } else {
            res.status(200).json({employee:selectResults.data});
        }
    }
});

module.exports = employeeRouter;