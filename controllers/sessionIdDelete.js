const { connection } = require("../utils/mysql");

exports.sessionIdDeleteControl = (req, res) => {
    // Get the ID of the question from the request parameters
    console.log("Question deleting attempt detected! " + res.statusCode);
    const qid = req.params.id;
    const query = `DELETE FROM questionhandler WHERE questionid = ${qid}`;
    try {
        connection.query(query, function (error, results, fields) {
            if (error) throw error;
            res.status(200).send(
                `Successfully deleting the session! (Session ID: ${qid})`
            );
            console.log(
                `Successfully deleting the session! (Session ID: ${qid})`
            );
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Internal Server Error" });
    }
};
