const express = require('express');
const timesheetRouter = express.Router({mergeParams: true});
const sqlite3 = require('sqlite3');

const dbUtils = require('./dbUtils');

// ************** begin routes implementation ***************

timesheetRouter.get('/', async (req, res, next) => {
    const employeeId = Number(req.params.employeeId);
    
    const employeeExixts = await dbUtils.selectOne('Employee', `id=${employeeId}`);
    if (employeeExixts.err) {
        next(employeeExixts.err);
    } else {
        if (!employeeExixts.data) {
            res.sendStatus(404);            
        } else {
            const allTimesheet = await dbUtils.getAll('Timesheet', 'employee_id', employeeId);
            if (allTimesheet.err) {
                next(allTimesheet.err);
            } else {
                res.status(200).json({timesheets:allTimesheet.data});
            }
        }
    }
});

timesheetRouter.post('/', async (req, res, next) => {
    const newTimesheet = req.body.timesheet;
    const {hours, rate, date} = newTimesheet;
    const employeeId = req.params.employeeId;
    
    if (!dbUtils.isValid(hours, rate, date)) {
        res.sendStatus(400);
        return;
    }

    const values = {
        $hours: hours,
        $rate: rate,
        $date: date,
        $employee_id: employeeId
    };
    
    const selectOneEmployee = await dbUtils.selectOne('Employee', `id=${employeeId}`);
    if (selectOneEmployee.err) {
        next(selectOneEmployee.err);
    } else {
        if (!selectOneEmployee.data) {
            res.sendStatus(404);
        } else {
            const postResults = await dbUtils.insertOne('Timesheet', values);
            if (postResults.err) {
                next(err);
            } else {
                const createdTimesheet = await dbUtils.selectOne('Timesheet', `id=${postResults.lastID}`);
                if (createdTimesheet.err) {
                    next (createdTimesheet.err);
                } else {
                    res.status(201).json({timesheet:createdTimesheet.data});
                }
            }
        }
    }
});

dbUtils.routerParam(timesheetRouter, 'Timesheet', 'timesheet');

timesheetRouter.put('/:id', async (req, res, next) => {
    const employeeId = Number(req.params.employeeId);
    const timesheetId = Number(req.params.id);
    const employeeUpdate = req.body.timesheet;
    const {hours, rate, date} = employeeUpdate;

    if (!dbUtils.isValid(hours, rate, date)) {
        res.sendStatus(400);
        return;
    }

    // the number of properties MUST be equal to
    // the number of variables used in the query
    // otherwise ERROR: "SQLITE_RANGE: bind or lumn index out of range" 
    const values = { 
        $hours: hours,
        $rate: rate,
        $date: date
    };
    const predicate = `id=${timesheetId};`;
    
    const employeeExists = await dbUtils.selectOne('Employee', `id=${employeeId}`);
    if (!employeeExists.data) {
        res.sendStatus(404);
    } else {
        const timesheetExists = await dbUtils.selectOne('Timesheet', `id=${timesheetId}`);
        if (!timesheetExists.data) {
            res.sendStatus(400);
            return;
        } else {
            const timesheetUpdate = await dbUtils.updateOne('Timesheet', values, predicate);
            if (timesheetUpdate.err) {
                next(timesheetUpdate.err);
            } else {
                const updatedTimesheet = await dbUtils.selectOne('Timesheet', `id=${timesheetId}`);
                if (updatedTimesheet.err) {
                    next(updatedTimesheet.err);
                } else {
                    res.status(200).json({timesheet:updatedTimesheet.data});
                }
            }
        }
    }
});

timesheetRouter.delete('/:id', async (req, res, next) => {
    const timesheetId = Number(req.params.id);
    const predicate = `id = ${timesheetId}`;

    const currentTimesheet = await dbUtils.selectOne('Timesheet', `id=${timesheetId}`);
    if (currentTimesheet.err) {
        next(currentTimesheet.err);
    } else {
        if (!currentTimesheet.data) {
            res.sendStatus(404);
        } else {
            const deleteResults = await dbUtils.deleteOne('Timesheet', predicate);
            if (deleteResults.err) {
                next(deleteResults.err);
            } else {
                res.status(204).json({timesheet:currentTimesheet.data});
            }
        }
    }
});

module.exports = timesheetRouter;