const express = require("express");
const { emergencyOff } = require("../controllers/emergencyoff");
const { checkIpMiddleware } = require("../utils/checkIpMiddleware");
const { registerControl } = require("../controllers/registerControl");
const { loginControl } = require("../controllers/loginControl");
const { submitControl } = require("../controllers/submitControl");
const { getQuestionTitleControl } = require("../controllers/getQuestionTitle");
const {
    questionProfileListControl,
} = require("../controllers/questionProfileList");
const {
    submitQuestionProfileListControl,
} = require("../controllers/submitQuestionProfileList");
const {
    getUsernameByQuestionIdControl,
} = require("../controllers/getUsernameByQuestionId");
const { questionsListControl } = require("../controllers/questionsList");
const { questionsControl } = require("../controllers/questions");
const {
    questionsIdDeleteControl,
} = require("../controllers/questionsIdDelete");
const { sessionIdDeleteControl } = require("../controllers/sessionIdDelete");
const {
    addSpecialUserGetControl,
    addSpecialUserPostControl,
} = require("../controllers/addSpecialUserControl");
const { specialUserListControl } = require("../controllers/specialUserList");
const {
    removeSpecialUserControl,
} = require("../controllers/removeSpecialUser");

const routes = express.Router();

// emergency off route
routes.post("/emergencyoff", emergencyOff);

// register route
routes.post("/register", checkIpMiddleware, registerControl);

// login route
routes.post("/login", checkIpMiddleware, loginControl);

// submit route
routes.post("/submit", checkIpMiddleware, submitControl);

// get question title route
routes.post(
    "/getquestiontitle/:id",
    checkIpMiddleware,
    getQuestionTitleControl
);

// get question per profile route
routes.post(
    "/questionsprofilelist/:id",
    checkIpMiddleware,
    questionProfileListControl
);

// submit Question Profile List
routes.post(
    "/submitquestionprofilelist",
    checkIpMiddleware,
    submitQuestionProfileListControl
);

// get username by question id
routes.post(
    "/getusernamebyquestionid/:id",
    checkIpMiddleware,
    getUsernameByQuestionIdControl
);

// questions list by id (send body id)
routes.post("/questionslist", checkIpMiddleware, questionsListControl);

// questions list id
routes.post("/questions/:id", checkIpMiddleware, questionsControl);

// delete question by id
routes.post(
    "/questions/:id/delete",
    checkIpMiddleware,
    questionsIdDeleteControl
);

// sesssion id delete
routes.post("/session/:id/delete", checkIpMiddleware, sessionIdDeleteControl);

// add special user post and get
routes
    .route("/addspecialuser")
    .get(checkIpMiddleware, addSpecialUserGetControl)
    .post(checkIpMiddleware, addSpecialUserPostControl);

// special user list
routes.post("/specialuserlist", checkIpMiddleware, specialUserListControl);

// remove special user
routes.post("/removespecialuser", checkIpMiddleware, removeSpecialUserControl);

// status post
routes.post("/status", checkIpMiddleware, (req, res) => {
    res.status(200).send("Server is running.");
    console.log(`Someone is pinged to this API! (${req.ip})`);
});

// profile route biarin sama willis
// app.get('/profile', (req, res) => {
//   const token = req.cookies.token;
//   const email = req.cookies.email;

//   if (!token || !email) {
//     return res.json({ error: 'No token or email found in cookie' });
//   }

//   return res.json({ token: token, email: email });
// });

module.exports = {
    routes,
};
