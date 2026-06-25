const sharp = require("sharp");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");

/**
 * Ensure upload directory exists
 */
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

/**
 * Process and save a single image using sharp.
 * Resizes to max 800px width, converts to JPEG with quality 80.
 *
 * @param {Object} file - multer file object (with buffer)
 * @param {string} folder - subfolder name under "uploads" (e.g. "users", "tasks")
 * @returns {Promise<string>} - relative path to saved image
 */
exports.processSingleImage = async (file, folder) => {
  const uploadDir = path.join(__dirname, "..", "uploads", folder);
  ensureDir(uploadDir);

  const filename = `${uuidv4()}.jpeg`;
  const filePath = path.join(uploadDir, filename);

  await sharp(file.buffer)
    .resize(800, undefined, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toFile(filePath);

  return `/uploads/${folder}/${filename}`;
};

/**
 * Process and save multiple images using sharp.
 *
 * @param {Array} files - array of multer file objects
 * @param {string} folder - subfolder name under "uploads"
 * @returns {Promise<string[]>} - array of relative paths
 */
exports.processMultipleImages = async (files, folder) => {
  const uploadDir = path.join(__dirname, "..", "uploads", folder);
  ensureDir(uploadDir);

  const urls = await Promise.all(
    files.map(async (file) => {
      const filename = `${uuidv4()}.jpeg`;
      const filePath = path.join(uploadDir, filename);

      await sharp(file.buffer)
        .resize(800, undefined, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toFile(filePath);

      return `/uploads/${folder}/${filename}`;
    })
  );

  return urls;
};