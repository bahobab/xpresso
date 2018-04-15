// database operation utilities

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

module.exports = {
    isValid: function(...args) {
        // const fields = Array.from(arguments); // ES 2015 - no arguments with =>
        const fields = [...args];
        // const fields = Array.prototype.slice.call(arguments);  // ES5
        return fields.every(element => !!element);
    },
    getAll: (entityRouter, path, dataType, table, column, value) => {
        entityRouter.get(path, (req, res, next) => {
            const query = `SELECT * FROM ${table} WHERE ${column}=${value};`;
            db.all(query, (err, data) => {
                if (err) {
                    next(err);
                    return;
                } else {
                    res.status(200).json({[dataType]:data});
                }
            });
        });
    },
    routerParam: (entityRouter, table, dataType) => {
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
    insertOne: (dataType, table, query, values, res, next) => {
        db.run(query, values,
            function(err) {
                if(err) {
                    next(err);
                } else {
                    selectOne(201, dataType, table, 'id', this.lastID, res, next);
                    // db.get(`SELECT * FROM ${table} WHERE id=${this.lastID};`,
                    //     (err, data) => {
                    //         if (err) {
                    //             next(err);
                    //         } else {
                    //             res.status(201).json({[dataType]:data});
                    //         }
                    //     });
                }
            } 
        );    
    },
    updateOne: (dataType, table, column, query, values, res, next) => {
        db.run(query, values,
            (err) => {
                if(err) {
                    // console.log('ERR PUT >>>>', err);
                    next(err);
                } else {
                    selectOne(200, dataType, table, column, values.$id, res, next);
                }
            } 
        );
    },
    deleteOne: (table, column, value) => {

    }
}

function selectOne(statusCode, dataType, table, column, value, res, next) {
    db.get(`SELECT * FROM ${table} WHERE ${column}=${value};`,
        (err, data) => {
            if (err) {
                console.log('ERR PUT/SELECT >>>>', err);
                next(err);
            } else {
                // console.log('SUCCESS PUT/SELECT >>>>', data);
                res.status(statusCode).json({[dataType]:data});
            }
        });
}