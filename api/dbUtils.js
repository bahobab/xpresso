// database operation utilities

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite',
            err => {
                if (err) {
                    console.log('Error connecting to in-memory database...');
                } else {
                    console.log('Successfully connected to in-memeory database...');
                }
            });

module.exports = {
  isValid: function(...args) {
    // checks that required fields are valid
    const fields = [...args];
    return fields.every(element => !!element);
    // const fields = Array.from(arguments); // ES 2015 - no arguments with =>
    // const fields = Array.prototype.slice.call(arguments);  // ES5    
  },

  getAll: (table, column, value) => {
    // return all elements of a given table
    return new Promise((resolve, reject) => {
        let query;
        if (table === 'Menu') {
            query =  `SELECT *
                        FROM
                            ${table}`;
        } else {
            query =  `SELECT *
                        FROM
                            ${table}
                        WHERE
                            ${column}=${value}`;
        }
    
      db.all(query, (err, data) => {
        const results = {};
        if (err) {
            results.err = err;
          reject(results);
        } else {
            // console.log('ALL>>>>', data);
            results.data = data;
          resolve(results);
        }
        // resolve(results);
      });
    });
  },

  routerParam: (entityRouter, table, dataType, id = 'id') => {
    // routerParam: (entityRouter, masterInfo = null, table, dataType) => {
    // process params for a given route. Return data on the rquest object
    entityRouter.param(id, (req, res, next, id) => {
      const query = `SELECT *
                    FROM ${table}
                    WHERE id = ${Number(id)};`;
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
    });
  },

  insertOne: (table, values) => {
    // Insert a row in given table. Return a promise
    return new Promise((resolve, reject) => {
        columnString = Object.keys(values)
                        .map(key => key.substr(1))
                            .join();
        const paramNames = Object.keys(values).join();
        const query = `INSERT 
                    INTO 
                        ${table}
                        (${columnString})
                    VALUES
                        (${paramNames});`; 

      db.run(query, values, function(err) {
        const results = {};
        if (err) {
          results.err = err;
          reject(results);
        } else {
          results.lastID = this.lastID;
          resolve(results);
        }
      });
    });
  },

  updateOne: (table, values, where) => {
    // Update a row in given table. Return a promise
    return new Promise((resolve, reject) => {
        const setArray = Object.keys(values)
                        .map(key => `${key.substr(1)}=${key}`);
        const setValues = setArray.join();        
        const query = `UPDATE ${table}
                            SET
                                ${setValues}
                            WHERE
                                ${where};`;
      db.run(query, values, err => {
        const results = {};
        if (err) {
          results.err = err;
          reject(results);
        }
        resolve(results);
      });
    });
  },

  deleteOne: (table, where) => {
    // Delete a row in given table. Return a promise
    return new Promise((resolve, reject) => {
        const results = {};
        db.run(
        `DELETE
                FROM
                    ${table}
                WHERE
                    ${where};`,
        err => {
            if (err) {
                results.err = err;
                reject(results);
            }
            resolve(results);
        }
      );
    });
  },

  selectOne: (table, where) => {
    // select a row in given table. Return a promise
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM ${table} WHERE ${where};`,
        (err, data) => {
          var foundOne = {};
          if (err) {
            foundOne.err = err;
            reject(foundOne);
          } else {
            foundOne.data = data;
            resolve(foundOne);
          }
        }
      );
    });
  }
}; // end export object

