const express = require('express');
const timesheetRouter = express.Router({mergeParams: true});
const sqlite3 = require('sqlite3');

const dbUtils = require('./dbUtils');

const db = new sqlite3.Database(process.env.TEST_DATABASE ||
                    './database.sqlite', (err) => {
                        if (err) {
                            console.log('Error connecting to Timesheet...')
                        } else {
                            console.log('Successfully conected to in-memory database - Timesheet...');
                        }
                    });

timesheetRouter.get('/', async (req, res, next) => {
    const employeeId = req.params.employeeId;
    const queryEmployee = `SELECT *
                                FROM 
                                    Employee
                                        WHERE
                                            id=$id;`;
    const value = {$id: employeeId};
    
    const queryTimeSheet = `SELECT *
                                FROM
                                    Timesheet
                                        WHERE
                                            employee_id=${employeeId};`;

    const selectOneEmployee = await dbUtils.selectOne(db, 'Employee', 'id', employeeId);
    if (selectOneEmployee.err) {
        next(selectOneEmployee.err);
    } else {
        if (!selectOneEmployee.data) {
            res.sendStatus(404);            
        } else {
            const selectAllTimesheet = await dbUtils.getAll(db, queryTimeSheet);
            if (selectAllTimesheet.err) {
                next(selectAllTimesheet.err);
            } else {
                res.status(200).json({timesheets:selectAllTimesheet.data});
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

    const postQuery = `INSERT INTO
                        Timesheet
                            (
                                hours,
                                rate,
                                date,
                                employee_id
                            )
                    VALUES
                        (
                            $hours,
                            $rate,
                            $date,
                            $employee_id
                        );`;
    const values = {
        $hours: hours,
        $rate: rate,
        $date: date,
        $employee_id: employeeId
    };
    
    const selectOneEmployee = await dbUtils.selectOne(db, 'Employee', 'id', employeeId);
    if (selectOneEmployee.err) {
        next(selectOneEmployee.err);
    } else {
        if (!selectOneEmployee.data) {
            res.sendStatus(404);
        } else {
            const postResults = await dbUtils.insertOne(db, postQuery, values);
            if (postResults.err) {
                next(err);
            } else {
                const createdTimesheet = await dbUtils.selectOne(db, 'Timesheet', 'id', postResults.lastID);
                if (createdTimesheet.err) {
                    next (createdTimesheet.err);
                } else {
                    res.status(201).json({timesheet:createdTimesheet.data});
                }
            }
        }
    }
});

dbUtils.routerParam(db, timesheetRouter, 'Timesheet', 'timesheet');

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
        $id: timesheetId,
        $hours: hours,
        $rate: rate,
        $date: date
    };

    const timeSheetQuery = `UPDATE Timesheet
                            SET
                                hours=$hours,
                                rate=$rate,
                                date=$date
                            WHERE
                                id=$id;`;
    
    const employeeExists = await dbUtils.selectOne(db, 'Employee', 'id', employeeId);
    if (!employeeExists.data) {
        res.sendStatus(404);
    } else {
        const timesheetExists = await dbUtils.selectOne(db, 'Timesheet', 'id', timesheetId);
        if (!timesheetExists.data) {
            res.sendStatus(400);
            return;
        } else {
            const timesheetUpdate = await dbUtils.updateOne(db, timeSheetQuery, values);
            if (timesheetUpdate.err) {
                next(timesheetUpdate.err);
            } else {
                const updatedTimesheet = await dbUtils.selectOne(db, 'Timesheet', 'id', timesheetId);
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

    const currentTimesheet = await dbUtils.selectOne(db, 'Timesheet', 'id', timesheetId);
    if (currentTimesheet.err) {
        next(currentTimesheet.err);
    } else {
        if (!currentTimesheet.data) {
            res.sendStatus(404);
        } else {
            const deleteResults = await dbUtils.deleteOne(db, 'Timesheet', 'id', timesheetId);
            if (deleteResults.err) {
                next(deleteResults.err);
            } else {
                res.status(204).json({timesheet:currentTimesheet.data});
            }
        }
    }
});

module.exports = timesheetRouter;