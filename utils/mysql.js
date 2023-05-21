const mysql = require("mysql");

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "userdata",
    charset: "utf8mb4",
});

const checkTableSql = "SHOW TABLES LIKE ?";

const createTableSql = `CREATE TABLE question (
    id INT(11),
    questionid INT(11),
    question VARCHAR(255) NOT NULL, 
    token VARCHAR(255)
  )`;

const createTableSql2 = `CREATE TABLE questionhandler (
    id INT(11),
    questionid INT(11), 
    questiontitle VARCHAR(255) NOT NULL
  )`;

const createTableSql3 = `CREATE TABLE special_user (
    id INT(11) PRIMARY KEY
  )`;

module.exports = {
    connection,
    checkTableSql,
    createTableSql,
    createTableSql2,
    createTableSql3,
};
