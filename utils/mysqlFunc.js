const {
    connection,
    checkTableSql,
    createTableSql,
    createTableSql3,
    createTableSql2,
} = require("./mysql");

const dbCheck = () => {
    return connection.connect((err) => {
        if (err) {
            console.log(err);
        } else {
            console.log("Connected to database");
            connection.query(
                `CREATE TABLE IF NOT EXISTS users (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255),
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                token VARCHAR(255) 
            )`,
                (err, result) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("Table created");
                    }
                }
            );
        }
    });
};

const questionTableCheck = () => {
    return connection.query(
        checkTableSql,
        ["question"],
        function (error, results, fields) {
            if (error) throw error;
            if (results.length === 0) {
                connection.query(
                    createTableSql,
                    function (error, results, fields) {
                        if (error) throw error;
                        console.log("Table created (question)");
                    }
                );
            } else {
                console.log("Table already exists (question)");
            }
        }
    );
};

const questionHandlerTableCheck = () => {
    return connection.query(
        checkTableSql,
        ["questionhandler"],
        function (error, results, fields) {
            if (error) throw error;
            if (results.length === 0) {
                connection.query(
                    createTableSql2,
                    function (error, results, fields) {
                        if (error) throw error;
                        console.log("Table created (questionhandler)");
                    }
                );
            } else {
                console.log("Table already exists (questionhandler)");
            }
        }
    );
};

const specialUserTableCheck = () => {
    return connection.query(
        checkTableSql,
        ["special_user"],
        function (error, results, fields) {
            if (error) throw error;
            if (results.length === 0) {
                connection.query(
                    createTableSql3,
                    function (error, results, fields) {
                        if (error) throw error;
                        console.log("Table created (special_user)");
                    }
                );
            } else {
                console.log("Table already exists (special_user)");
            }
        }
    );
};

module.exports = {
    dbCheck,
    questionTableCheck,
    questionHandlerTableCheck,
    specialUserTableCheck,
};
