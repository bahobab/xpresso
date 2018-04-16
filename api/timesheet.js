const express = require('express');
const timesheetRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(process.env.TEST_DATABASE ||
                    './database.sqlite', (err) => {
                        if (err) {
                            console.log('Error connecting to Timesheet...')
                        } else {
                            console.log('Successfully conected to in-memory database - Timesheet...');
                        }
                    });

// timesheetRouter.get('/', (req, res, next) => {
//     const employeeId = req.params.employeeId;
//     const query = `SELECT *
//                         FROM Employee
//                             WHERE
//                                 id=$id;`;
//     const value = {$id: employeeId};

// });

module.exports = timesheetRouter;