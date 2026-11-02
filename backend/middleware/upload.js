const multer = require('multer');

// kept in memory, then utils/images.js sends it to Cloudinary (or the local uploads folder)
module.exports = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) =>
    /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype) ? cb(null, true) : cb(new Error('Only JPG, PNG, WEBP or GIF images are allowed')),
});
