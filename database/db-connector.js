// Instantiating mysql for use in app
const mysql = require('mysql')

// Creating 'connection pool' with below credentials
const pool = mysql.createPool({
    connectionLimit : 10,
    host            : 'classmysql.engr.oregonstate.edu',
    user            :
    password        :
    database        :
})

// Exporting for use in app
module.exports.pool = pool;