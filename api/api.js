const express = require('express');
const apiRouter = express.Router();

const employeeRouter = require('./employee');

apiRouter.use('/employee', employeeRouter);

module.exports = apiRouter;