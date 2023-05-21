const { getQuestionsPerProfile } = require("../utils/getQuestions");

exports.questionProfileListControl = async (req, res) => {
    const id = req.params.id;
    console.log("Questions getting attempt detected! " + res.statusCode);
    try {
        const questions = await getQuestionsPerProfile(id);
        res.json(questions);
        console.log(
            "Successfully sending the questionsprofile list! (SUCCESS)"
        );
    } catch (error) {
        console.error(error);
        res.status(500).send(
            "Error retrieving questionsprofile from the database."
        );
        console.log(
            "Error retrieving questionsprofile from the database. (500)"
        );
    }
};
