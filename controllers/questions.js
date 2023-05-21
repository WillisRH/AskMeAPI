const { connection } = require("../utils/mysql");

exports.questionsControl = (req, res) => {
    // Get the ID of the question from the request parameters
    console.log("Question getting attempt detected! " + res.statusCode);
    const id = req.params.id;
    const query = `SELECT * FROM question WHERE id = ${id}`;
    try {
        connection.query(query, function (error, results, fields) {
            if (error) throw error;
            res.status(200).send(results[0]);
            console.log("Successfully sending the question! (SUCCESS)");
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Internal Server Error" });
    }
};
