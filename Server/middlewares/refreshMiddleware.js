const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");

module.exports = (req, res, next) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    return next(new ApiError("No refresh token provided", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return next(new ApiError("Unauthorized, invalid refresh token", 401));
  }
};