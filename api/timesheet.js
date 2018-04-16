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


module.exports = timesheetRouter;