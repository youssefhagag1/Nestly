const multer = require("multer");
const ApiError = require("../utils/ApiError");

const multerOptions = () => {
  // memory storage so we can process with sharp
  const storage = multer.memoryStorage();

  const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb(new ApiError("Only images allowed", 400), false);
    }
  };

  return multer({ storage, fileFilter });
};

/**
 * Upload a single image.
 * @param {string} fieldName - e.g. "image" for user profile
 */
exports.uploadSingleImage = function (fieldName) {
  return function (req, res, next) {
    const upload = multerOptions().single(fieldName);
    console.log(req.file)
    upload(req, res, function (err) {
      if (err) {
        return next(new ApiError(err.message, 400));
      }

      next();
    });
  };
};

/**
 * Upload up to `maxCount` images.
 * @param {string} fieldName - e.g. "images" for task submission
 * @param {number} maxCount  - maximum number of files
 */
exports.uploadMultipleImages = function (fieldName, maxCount) {
  return function (req, res, next) {
    const upload = multerOptions().array(fieldName, maxCount);

    upload(req, res, function (err) {
      if (err) {
        return next(new ApiError(err.message, 400));
      }

      next();
    });
  };
};