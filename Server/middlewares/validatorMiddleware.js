const { validationResult } = require("express-validator");

// Middleware to check validation results after all validators run
const validatorMiddleware = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((err) => err.msg).join(". ");
    return res.status(400).json({
      status: "fail",
      message: messages,
    });
  }
  next();
};

module.exports = validatorMiddleware;