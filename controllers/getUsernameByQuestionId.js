const { connection } = require("../utils/mysql");

exports.getUsernameByQuestionIdControl = async (req, res) => {
    const questionId = req.params.id;

    // Query the question table to get the question
    connection.query(
        "SELECT * FROM questionhandler WHERE questionid = ?",
        [questionId],
        (error, results) => {
            if (error) throw error;

            // Get the id from the question row
            const id = results[0].id;
            console.log(id);
            // Query the user table to get the username
            connection.query(
                `SELECT * FROM users WHERE id = ${id}`,
                (error, results) => {
                    if (error) throw error;

                    const username = results[0].username;
                    res.json(username);
                }
            );
        }
    );
};
