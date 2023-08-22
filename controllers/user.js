const { user } = require("../utils/database");

exports.getUserData = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(201).json({ err: "User id not defined." });
  }

  const findUser = await user.findOne({
    id: id,
  });

  if (!findUser) {
    return res.status(202).json({ err: "User not found" });
  }

  return res.status(200).json(findUser);
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(201).json({ err: "User id not defined." });
  }

  const findUser = await user.findOne({
    id: id,
  });

  if (!findUser) {
    return res.status(202).json({ err: "User not found" });
  }

  await user.deleteOne({
    id: id,
  });
  return res.status(200).json({ err: "User deleted successfully" });
};
