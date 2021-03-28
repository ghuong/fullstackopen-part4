const logger = require("./logger");
const morgan = require("morgan");

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

const errorHandler = (error, request, response, next) => {
  logger.error(error.message);

  switch (error.name) {
    case "CastError":
      return response.status(400).send({ error: "Malformatted id" });
    case "ValidationError":
      return response.status(400).json({ error: error.message });
  }

  next(error);
};

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
};
