const { connection } = require("../utils/mysql");

exports.questionsIdDeleteControl = (req, res) => {
    // Get the ID of the question from the request parameters
    console.log("Question deleting attempt detected! " + res.statusCode);
    const id = req.params.id;
    const query = `DELETE FROM question WHERE id = ${id}`;
    try {
        connection.query(query, function (error, results, fields) {
            if (error) throw error;
            res.status(200).send(
                `Successfully deleting the question! (Question ID: ${id})`
            );
            console.log(
                `Successfully deleting the question! (Question ID: ${id})`
            );
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Internal Server Error" });
    }
};
