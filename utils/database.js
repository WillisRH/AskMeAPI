const mongoose = require("mongoose");

// Database Middleware
const connectDB = (req, res, next) => {
  try {
    mongoose.connect(process.env.MONGODB, { dbName: "AskMe" });
    console.log("Database OK");
    return next();
  } catch (err) {
    console.log(err);
    return res.status(299).json({ err: "Failed connecting to database" });
  }
};

// Session/Question schema
const schema = mongoose.Schema;
const sessionSchema = new schema({
  id: Number,
  creator: Number,
  question: String,
  answers: [
    {
      id: Number,
      answer: String,
    },
  ],
});

const session = mongoose.model("session", sessionSchema);

// User Account schema
const userSchema = new schema({
  id: Number,
  username: String,
  email: String,
  password: String,
  special: Boolean,
  createdAt: String,
});

const user = mongoose.model("user", userSchema);

module.exports = {
  user,
  session,
  connectDB,
};
