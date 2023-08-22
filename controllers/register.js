const { hashSync, genSaltSync } = require("bcrypt");
const { user } = require("../utils/database");
const { generateUniqueId } = require("../utils/uniqueIdGen");

exports.registerControl = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(203).json({ err: "Credentials not complete" });
  }

  // Generate unique id
  const id = generateUniqueId();
  const findId = await user.findOne({
    id: id,
  });

  while (findId) {
    id = generateUniqueId();
  }

  // Check now date
  const now = new Date();
  const fullDate = now.toLocaleString("en-IN", {
    day: "numeric",
    weekday: "long",
    year: "numeric",
    month: "long",
  });

  // Hash the password
  const salt = genSaltSync(10);
  const hashPass = hashSync(password, salt);

  // Check if username is already used
  const findByUsername = await user.findOne({
    username: username,
  });

  // Check if email is already used
  const findByEmail = await user.findOne({
    email: email,
  });

  if (findByUsername) {
    return res.status(201).json({ err: "Username already used" });
  }

  if (findByEmail) {
    return res.status(202).json({ err: "Email already used" });
  }

  // Create new user data
  await user.create({
    id: id,
    username: username,
    email: email,
    password: hashPass,
    createdAt: fullDate,
  });

  const token = jwt.sign(
    {
      id,
      username,
      email,
    },
    process.env.SECRET_TOKEN_KEY
  );

  return res
    .status(200)
    .json({ err: "Successfully Registered New Account!", token });
};
