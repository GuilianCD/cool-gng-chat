const sqlite3 = require('sqlite3').verbose();
const nodeCleanup = require('node-cleanup');

function openDB(){
    const db = new sqlite3.Database('./db/users.db', (err) => {
        if (err) {
            console.error(err.message);
        }else{
            console.log('Connected to the in-memory SQlite database.');

            db.run('CREATE TABLE IF NOT EXISTS users ('
                + 'id INTEGER PRIMARY KEY AUTOINCREMENT,'
                + 'username TEXT UNIQUE NOT NULL,'
                + 'password TEXT NOT NULL'
                + ');'
                );

            nodeCleanup((exitCode, signal) => {
                // release resources here before node exits
                closeDB();
            });
        }
    });
}
openDB();




function hashString(str) {
    let hash = 0, i, chr;

    for (i = 0; i < this.length; i++) {
        chr = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

function verifyPassword(username, rawPassword) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT
            password as password
            FROM users WHERE username=?;`, 
            [username],
            (err, row) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }

                let hashed = hashString(rawPassword);

                let result = {};

                if(hashed === row.password){
                    result.success = true;
                }else{
                    result.success = false;
                    if(! row){
                        result.usernameNotExists = true;
                    }
                }
                resolve(result);
            }
        );
    });
}


function registerUser(username, rawPassword){
    return new Promise((resolve, reject) => {
        db.run(`INSERT INTO users(username, password) VALUES(?, ?)`, [username, hashString(rawPassword)], function(err) {
            if (err) {
                console.error(err.message);
                reject(err);
            }
            resolve();
        });
    });
}


function closeDB() {
    // close the database connection
    db.close((err) => {
        if (err) {
            return console.error(err.message);
        }
    console.log('Close the database connection.');
});
}

module.exports = {
    verifyPassword,
    registerUser,
    closeDB
}
