// database operation utilities

// const sqlite3 = require('sqlite3');
// const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

module.exports = {
    isValid: function(...args) {
        // const fields = Array.from(arguments); // ES 2015 - no arguments with =>
        const fields = [...args];
        // const fields = Array.prototype.slice.call(arguments);  // ES5
        return fields.every(element => !!element);
    },
    getAll: (db, query) => {
        return new Promise(resolve => {        
            db.all(query, (err, data) => {
                const results = {};
                if (err) {
                    results.err = err;
                } else {
                    results.data = data;
                }
                resolve(results);
            });
        });
    },
    routerParam: (db, entityRouter, table, dataType) => {
        entityRouter.param('id', (req, res, next, id) => {
            const query = `SELECT *
                            FROM ${table}
                                WHERE id = ${Number(id)};`
            db.get(query, (err, data) => {
                if (err) {
                    next(err);
                } else {
                    if (!data) {
                        res.status(404).send(); // or res.sendStatus(404)
                        return;
                    }
                    req[dataType] = data;
                    next();
                }
            });
        })
    },
    insertOne: (db, query, values) => {
        return new Promise(resolve => {
            db.run(query, values,
                function(err) {
                    const results = {};
                    if(err) {
                        results.err = err;
                    } else {
                        results.lastID = this.lastID;
                    }
                    resolve(results);
                });
        });
    },
    updateOne: (db, query, values) => {
        return new Promise(resolve => {
            db.run(query, values,  (err) => {
                const results = {};                
                if(err) {
                    results.err = err;
                }
                resolve(results);
            });
        });
    },
    deleteOne: (table, column, value) => {

    },
    selectOne: (db, table, column, value) => {
        return new Promise((resolve) => {
            db.get(`SELECT * FROM ${table} WHERE ${column}=${value};`,
            (err, data) => {
                var foundOne = {};
                if (err) {
                    foundOne.err = err;
                } else {
                    foundOne.data = data;
                }
                resolve(foundOne)
            });
        });
    }

} // end export object

// function selectOne(statusCode, dataType, table, column, value, res, next) {
//     const foundOne = {};
//     db.get(`SELECT * FROM ${table} WHERE ${column}=${value};`,
//         (err, data) => {
//             if (err) {
//                 // foundOne.err = err;
//                 // return foundOne.err = err;
//                 console.log('ERR PUT/SELECT >>>>', err);
//                 next(err);
//             } else {
//                 foundOne.data = data;
//                 // return foundOne.data;
//                 // console.log('SUCCESS PUT/SELECT >>>>', data);
//                 res.status(statusCode).json({[dataType]:data});
//             }
//         });
// }