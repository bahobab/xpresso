// database operation utilities

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

module.exports = {
    getAll: async function(dataType, query, req, res, next) {
        await db.all(query, (err, data) => {
            if (err) {
                next(err);
                return;
            } else {
                res.status(200).json({[dataType]:data});
            }
        });
    },
    getOne: (table, column, value) => {

    },
    // insertOne: (table, ...columns, ...values) => {

    // },
    updateOne: (table, column, value) => {

    },
    deleteOne: (table, column, value) => {

    }
}