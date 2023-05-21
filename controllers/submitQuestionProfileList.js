const { connection } = require("../utils/mysql");
const { generateUniqueId } = require("../utils/uniqueIdGen");

exports.submitQuestionProfileListControl = async (req, res) => {
    const userid = req.body.userid;
    const question = req.body.question;

    try {
        let randomIntString = await generateUniqueId(connection);
        const sql =
            "INSERT INTO questionhandler (id, questionid, questiontitle) VALUES (?, ?, ?)";
        connection.query(
            sql,
            [userid, randomIntString, question],
            function (error, results, fields) {
                if (error) {
                    throw error;
                }
                res.status(200).json({
                    message: "Success saving the question into the database!",
                });
            }
        );
    } catch (error) {
        res.status(500).json({ error: "Error when creating question!" });
    }
};
