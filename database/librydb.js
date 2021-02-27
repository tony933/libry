const { Module } = require('module');
const mysql = require('mysql');
// connection in databases mysql
var pool  = mysql.createPool({
host:  process.env.DB_HOST,
user: process.env.DB_USER,
password: process.env.DB_PASSWORD,
database : process.env.DB_DATABASE
})
pool.getConnection(function(err) {
if (err) {
   console.log(`something want wrong:$[err]`)
} else {
    console.log("Connected!");
}

})
module.exports = pool