const express = require('express');
const sqlite3 = require('sqlite3');

const app = express();
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite', (err) => {
    if (err) {
        console.log('Error creating/connecting to database', err);
    } else {
        console.log('Connected to database');
    }
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Server listening to port ${PORT}`);
})