const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const {
    dbCheck,
    questionTableCheck,
    questionHandlerTableCheck,
    specialUserTableCheck,
} = require("./utils/mysqlFunc");
const { routes } = require("./routes/routes");
require("dotenv").config();
/**
 *
 * Database thing
 *
 */

dbCheck();
questionTableCheck();
questionHandlerTableCheck();
specialUserTableCheck();

/**
 *
 * Express thing
 *
 */
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
// routes
app.use(routes);

app.get("/", (req, res) => {
    res.render("home.ejs");
});

app.listen(3000, () => console.log("Server started on port 3000"));
