const { connection } = require("../utils/mysql");

exports.getQuestionTitleControl = async (req, res) => {
    const questionid = req.params.id;

    const query = `SELECT * FROM questionhandler WHERE questionid = ${questionid}`;
    connection.query(query, (error, results, fields) => {
        if (error) {
            res.send({ error: "Error fetching data from database" });
            return;
        }

        if (results.length === 0) {
            res.send({ error: "Question not found" });
            return;
        }

        // Send the response
        res.json({ questiontitle: results[0].questiontitle });
    });
};
