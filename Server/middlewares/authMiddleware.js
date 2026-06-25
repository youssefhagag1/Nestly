const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");

module.exports = (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.headers.authorization?.split(" ")[1];

  if (!token) {
    return next(new ApiError("Unauthorized, no token provided", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    // Ensure both id and _id are available for compatibility
    req.user._id = decoded.id;
    next();
  } catch (err) {
    return next(new ApiError("Unauthorized, invalid token", 401));
  }
};