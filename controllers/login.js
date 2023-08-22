const { compareSync } = require("bcrypt");
const { user } = require("../utils/database");
const jwt = require("jsonwebtoken");

exports.loginControl = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(201).json({ err: "Incomplete credentials" });
  }

  const findUser = await user.findOne({
    username: username,
  });

  if (!findUser) {
    return res.status(202).json({ err: "Username doesn't exists" });
  }

  const checkPass = compareSync(password, findUser.password);

  if (!checkPass) {
    return res.status(203).json({ err: "Incorrect password!" });
  }

  const id = findUser.id;
  const email = findUser.email;

  const token = jwt.sign(
    {
      id,
      username,
      email,
    },
    process.env.SECRET_TOKEN_KEY
  );

  return res.status(200).json({ token });
};
