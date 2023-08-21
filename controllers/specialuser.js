const { user } = require("../utils/database");

exports.getSpecialUsers = async (req, res) => {
  const findUsers = await user.find({
    special: true,
  });
  console.log(findUsers);

  return res.status(200).json(findUsers);
};

exports.addSpecialUser = async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(201).json({ err: "User id not defined" });
  }

  const findUser = await user.findOne({
    id: id,
  });

  if (!findUser) {
    return res.status(202).json({ err: "User with that id not found" });
  }

  await findUser.updateOne({
    $set: {
      special: true,
    },
  });
  return res.status(200).json({ err: "User is now a special user." });
};

exports.removeSpecialUser = async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(201).json({ err: "User id not defined" });
  }

  const findUser = await user.findOne({
    id: id,
  });

  if (!findUser) {
    return res.status(202).json({ err: "User with that id not found" });
  }

  await findUser.updateOne({
    $set: {
      special: false,
    },
  });
  return res.status(200).json({ err: "User is not a special user anymore." });
};
