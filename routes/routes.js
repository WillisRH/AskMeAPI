const express = require("express");
const { registerControl } = require("../controllers/register");
const { loginControl } = require("../controllers/login");
const {
  getSession,
  createSession,
  getUserSession,
  deleteSession,
  newAnswer,
  deleteAnswer,
} = require("../controllers/session");
const {
  addSpecialUser,
  getSpecialUsers,
  removeSpecialUser,
} = require("../controllers/specialuser");
const { getUserData, deleteUser } = require("../controllers/user");
const routes = express.Router();

// Auth routes
routes.post("/register", registerControl);
routes.post("/login", loginControl);

// Session routes
routes.get("/session/:id", getSession);
routes.get("/user-sessions/:creatorid", getUserSession);
routes.post("/session", createSession); // body : question, creatorid
routes.delete("/session/:id", deleteSession);
routes.patch("/new-answer", newAnswer); // body : sessionid, answer
routes.patch("/delete-answer", deleteAnswer); // body : sessionid, answerid

// User routes
routes.get("/user/:id", getUserData);
routes.delete("/user/:id", deleteUser);

// Special User routes
routes.patch("/add-specialuser", addSpecialUser);
routes.get("/specialusers", getSpecialUsers);
routes.patch("/remove-specialuser", removeSpecialUser);

module.exports = {
  routes,
};
