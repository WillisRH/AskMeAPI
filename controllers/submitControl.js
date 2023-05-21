const { connection } = require("../utils/mysql");
const { generateUniqueId } = require("../utils/uniqueIdGen");

exports.submitControl = (req, res) => {
    generateUniqueId(connection).then((id) => {
        const question = req.body.question;
        const questionid = req.body.id;
        console.log(req.body);
        const checkSql =
            "SELECT COUNT(*) AS count FROM questionhandler WHERE questionid = ?";
        connection.query(
            checkSql,
            [questionid],
            function (error, results, fields) {
                if (error) {
                    console.error(error);
                    res.status(500).send({
                        error: "An error occurred while checking the question ID.",
                    });
                } else {
                    const count = results[0].count;
                    if (count > 0) {
                        const insertSql =
                            "INSERT INTO question (id,question, questionid) VALUES (?,?,?)";
                        connection.query(
                            insertSql,
                            [id, question, questionid],
                            function (error, results, fields) {
                                if (error) {
                                    console.error(error);
                                    res.status(500).send({
                                        error: "An error occurred while inserting the question.",
                                    });
                                } else {
                                    console.log("|-------------------------|");
                                    console.log("A new record inserted!");
                                    console.log("ID: " + id);
                                    console.log("QuestionID: " + questionid);
                                    console.log(
                                        'A new Question appeared: "' +
                                            question +
                                            '"'
                                    );
                                    console.log("|-------------------------|");
                                    console.log("");
                                    console.log("");
                                    res.status(200).send({
                                        message:
                                            "Question submitted successfully.",
                                    });
                                }
                            }
                        );
                    } else {
                        res.status(400).send({ error: "Invalid question ID." });
                    }
                }
            }
        );
    });
};

// app.post('/submit', function (req, res) {
//     generateUniqueId(connection).then((id) => {
//         const question = req.body.question;
//         const questionid = req.body.id;
//         console.log(req.body);
//         const sql = 'INSERT INTO question (id,question, questionid) VALUES (?,?,?)';
//         connection.query(sql, [id, question, questionid], function (error, results, fields) {
//             if (error) {
//                 console.error(error);
//                 res.status(500).send({ error: 'An error occurred while inserting the question.' });
//             } else {
//                 console.log("|-------------------------|")
//                 console.log('A new record inserted!');
//                 console.log('ID: ' + id);
//                 console.log('QuestionID: ' + questionid)
//                 console.log('A new Question appeared: \"' + question + "\"")
//                 console.log("|-------------------------|")
//                 console.log("")
//                 console.log("")
//                 res.status(200).send({ message: 'Question submitted successfully.' });
//             }
//         });
//     });
// });
