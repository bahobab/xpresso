// database operation utilities

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

module.exports = {

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
                    db.get(`SELECT * FROM ${table} WHERE id=${this.lastID};`,
                        (err, data) => {
                            if (err) {
                                console.log('ERR retrieving >>>>', err);
                                next(err);
                            } else {
                                // console.log('SUCCESS posting >>>>', employee);
                                res.status(201).json({[dataType]:data});
                            }
                        })
                }
            } 
        );    
    },
    updateOne: (table, column, value) => {

    },
    deleteOne: (table, column, value) => {

    }
}