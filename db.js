const mysql = require('mysql2');
const connection = mysql.createConnection({
    host: 'localhost', // MYSQL HOST NAME
    user: 'root', // MYSQL USERNAME
    password: '1234', // MYSQL PASSWORD
    database: 'wallet_api' // MYSQL DB NAME
});
connection.connect();


module.exports = connection;