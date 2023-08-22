const { session, user } = require("../utils/database");
const { generateUniqueId } = require("../utils/uniqueIdGen");

exports.getSession = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(201).json({ err: "Session ID not defined." });
  }

  const findSession = await session.findOne({
    id: id,
  });

  if (!findSession) {
    return res.status(202).json({ err: `Session with id ${id} not found` });
  }

  return res.status(200).json(findSession);
};

exports.createSession = async (req, res) => {
  const { question, creator } = req.body;

  const id = generateUniqueId();

  if (!question || !creator) {
    return res.status(201).json({ err: "Question or creator id not defined." });
  }

  const findId = await session.findOne({
    id: id,
  });

  const findCreator = await user.findOne({
    id: creator,
  });

  while (findId) {
    id = generateUniqueId();
  }

  if (!findCreator) {
    return res.status(202).json({ err: "Creator id not found" });
  }

  await session.create({
    id: id,
    creator: creator,
    question: question,
    answers: [],
  });
  return res.status(200).json({ err: "Session created." });
};

exports.getUserSession = async (req, res) => {
  const { creatorid } = req.params;

  if (!creatorid) {
    return res.status(201).json({ err: "Creator id not defined" });
  }

  const findUser = await user.findOne({
    id: creatorid,
  });

  if (!findUser) {
    return res.status(202).json({ err: "User with that id not found" });
  }

  const findUserSession = await session.find({
    creator: creatorid,
  });

  return res.status(200).json(findUserSession);
};

exports.deleteSession = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(201).json({ err: "Session id not defined." });
  }

  const findSession = await session.findOne({
    id: id,
  });

  if (!findSession) {
    return res.status(202).json({ err: "Session with that id not found" });
  }

  await findSession.deleteOne();
  return res.status(200).json({ err: "Session successfully deleted." });
};

exports.newAnswer = async (req, res) => {
  const { sessionid, answer } = req.body;
  const id = generateUniqueId();

  if (!sessionid || !answer) {
    return res.status(201).json({ err: "Session id or answer not defined" });
  }

  const findSession = await session.findOne({
    id: sessionid,
  });

  if (!findSession) {
    return res.status(202).json({ err: "Session not found." });
  }

  const findAnswerId = await session.findOne({
    id: sessionid,
    "answers.id": id,
  });

  while (findAnswerId) {
    id = generateUniqueId();
  }

  await findSession.updateOne({
    $push: {
      answers: {
        id: id,
        answer: answer,
      },
    },
  });
  return res.status(200).json({ err: "Answer uploaded!" });
};

exports.deleteAnswer = async (req, res) => {
  const { sessionid, answerid } = req.body;

  if (!sessionid || !answerid) {
    return res.status(201).json({ err: "Session id or answer id not defined" });
  }

  const findSession = await session.findOne({
    id: sessionid,
  });

  if (!findSession) {
    return res.status(202).json({ err: "Session with that id not found" });
  }

  const findAnswer = await session.findOne({
    id: sessionid,
    "answers.id": answerid,
  });

  if (!findAnswer) {
    return res
      .status(203)
      .json({ err: "Answer with that id not found in this session" });
  }

  await findSession.updateOne({
    $pull: {
      answers: {
        id: answerid,
      },
    },
  });
  return res.status(200).json({ err: "Answer deleted successfully." });
};
