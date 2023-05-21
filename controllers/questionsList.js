const { getQuestions } = require("../utils/getQuestions");

exports.questionsListControl = async (req, res) => {
    console.log("Questions getting attempt detected! " + res.statusCode);
    const id = req.body.id;
    try {
        const questions = await getQuestions(id);
        res.json(questions);
        console.log("Successfully sending the questions list! (SUCCESS)");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving questions from the database.");
        console.log("Error retrieving questions from the database. (500)");
    }
};
