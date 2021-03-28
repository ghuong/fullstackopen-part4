const usersRouter = require("express").Router();
const bcrypt = require("bcryptjs");
const config = require("../utils/config");
const User = require("../models/user");

usersRouter.get("/", async (request, response) => {
  const users = await User.find({});
  response.json(users);
});

usersRouter.post("/", async (request, response) => {
  const body = request.body;

  if (!body.password) {
    return response.status(400).json({ error: "Password is required." });
  } else if (body.password.length < config.MIN_PASSWORD_LENGTH) {
    return response.status(400).json({
      error: `Password must be at least ${config.MIN_PASSWORD_LENGTH} characters long.`,
    });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(body.password, saltRounds);

  const user = new User({
    username: body.username,
    name: body.name,
    passwordHash,
  });

  const savedUser = await user.save();

  response.json(savedUser);
});

module.exports = usersRouter;
