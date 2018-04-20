const express = require('express');
const employeeRouter = express.Router();
const sqlite3 = require('sqlite3');

const dbUtils = require('./dbUtils');

const timesheetRouter = require('./timesheet');
employeeRouter.use('/:employeeId/timesheets', timesheetRouter);

// ************** begin routes implementation ***************

employeeRouter.get('/', async (req,res, next) => {
    
    const selectAll = await dbUtils.getAll('Employee', 'is_current_employee', 1);
    if (selectAll.err) {
        next(selectAll.err);
    } else {
        res.status(200).json({employees:selectAll.data});        
    }
});

employeeRouter.post('/', async (req, res, next) => {
    const newEmployee = req.body.employee;
    const {name, position, wage} = newEmployee;

    if (!dbUtils.isValid(name, position, wage)) {
        res.sendStatus(400);
        return;
    }
    
    const values = {
        $name: newEmployee.name,
        $position: newEmployee.position,
        $wage: newEmployee.wage,
        $is_current_employee: 1
    };

    const postResults = await dbUtils.insertOne('Employee', values);
    if (postResults.err) {
        next(postResults.err);
    } else {
        const selectResults = await dbUtils.selectOne('Employee', `id=${postResults.lastID}`);
        if (selectResults.err) {
            next(selectResults.err);
        } else {
            res.status(201).json({employee:selectResults.data});
        }
    }
});

dbUtils.routerParam(employeeRouter, 'Employee', 'employee');

employeeRouter.get('/:id', (req, res,next) => {
    res.status(200).json({employee:req.employee})
});

employeeRouter.put('/:id', async (req, res, next) => {
    const newEmployee = req.body.employee;
    const employeeId = Number(req.params.id);
    const {name, position, wage} = newEmployee;

    if (!dbUtils.isValid(name, position, wage)) {
        res.sendStatus(400);
        return;
    }

    const values = {
        // $id: employeeId,
        $name: newEmployee.name,
        $position: newEmployee.position,
        $wage: newEmployee.wage,
        $is_current_employee: 1
    };
    const predicate = `id=${employeeId}`;

    const updateResults = await dbUtils.updateOne('Employee', values, predicate);
    if (updateResults.err) {
        next(updateResults.err);
    } else {
        const selectResults = await dbUtils.selectOne('Employee', `id=${employeeId}`);
        if (selectResults.err) {
            next(selectResults.err);
        } else {
            res.status(200).json({employee:selectResults.data});
        }
    }
});

employeeRouter.delete('/:id', async (req, res, next) => {
    const employeeId = Number(req.params.id);

    const values = {
        // $id: employeeId,
        $is_current_employee: 0
    };
    const predicate = `id=${employeeId}`;

    const updateResults = await dbUtils.updateOne('Employee', values, predicate);
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