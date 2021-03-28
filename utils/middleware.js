const jwt = require("jsonwebtoken");
const logger = require("./logger");
const morgan = require("morgan");
const User = require("../models/user");

morgan.token("body", (request, response) => {
  if (request.method === "POST") {
    return JSON.stringify(request.body);
  } else {
    return "";
  }
});

const requestLogger = morgan(
  (tokens, request, response) =>
    [
      tokens.method(request, response),
      tokens.url(request, response),
      tokens.status(request, response),
      tokens.res(request, response, "content-length"),
      "-",
      tokens["response-time"](request, response),
      "ms",
      tokens.body(request, response),
    ].join(" "),
  {
    skip: (req, res) => process.env.NODE_ENV === "test",
  }
);

const unknownEndpoint = (request, response, next) => {
  response.status(404).send({ error: "unknown endpoint" });
};

const tokenExtractor = (request, response, next) => {
  const authorization = request.get("authorization");
  if (authorization?.toLowerCase().startsWith("bearer")) {
    request.token = authorization.substring("bearer ".length);
  }

  next();
};

const userExtractor = async (request, response, next) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET);
  if (!request.token || !decodedToken.id) {
    return response.status(401).json({ error: "token missing or invalid" });
  }
  request.user = await User.findById(decodedToken.id);
  next();
};

const errorHandler = (error, request, response, next) => {
  logger.error(error.message);

  switch (error.name) {
    case "CastError":
      return response.status(400).send({ error: "Malformatted id" });
    case "ValidationError":
      return response.status(400).json({ error: error.message });
    case "JsonWebTokenError":
      return response.status(401).json({ error: "Invalid token" });
    case "TokenExpiredError":
      return response.status(401).json({ error: "Token expired" });
  }

  next(error);
};

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor,
};
