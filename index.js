const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const { routes } = require("./routes/routes");
const { connectDB } = require("./utils/database");
const { checkIpMiddleware } = require("./utils/checkIpMiddleware");
const { generateUniqueId } = require("./utils/uniqueIdGen");
require("dotenv").config();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
// Database Middleware
app.use(connectDB);
// IP Checker Middleware
app.use(checkIpMiddleware);
// routes
app.use(routes);

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
