const mysql = require('mysql');

const db = mysql.createConnection({
    host : 'sql6.freesqldatabase.com' ,
    user : 'sql6425071' ,
	password: 'NSdShGznnT',
    database:'sql6425071'
});

db.connect((err) => {
    if(err){
        throw err;
    }
    console.log('Mysql connected....')
})

//let sql = 'CREATE DATABASE nodemysql';
//db.query(sql);
//console.log("done");


module.exports = db;
