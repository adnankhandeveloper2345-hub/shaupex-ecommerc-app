// Saves product photos to Cloudinary. If Cloudinary keys are not in .env yet,
// photos are saved in backend/uploads so the shop still works while you set things up.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { v2: cloudinary } = require('cloudinary');

const UPLOADS = path.join(__dirname, '..', 'uploads');
const EXT = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif' };

const cloudReady = () =>
  !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

const configure = () =>
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

// returns { url, publicId }
async function saveImage(file) {
  if (cloudReady()) {
    configure();
    const r = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'shaupex/products',
          resource_type: 'image',
          transformation: [{ width: 1200, height: 1200, crop: 'limit' }, { quality: 'auto', fetch_format: 'auto' }],
        },
        (err, res) => (err ? reject(err) : resolve(res))
      );
      stream.end(file.buffer);
    });
    return { url: r.secure_url, publicId: r.public_id };
  }
  fs.mkdirSync(UPLOADS, { recursive: true });
  const name = Date.now() + '-' + crypto.randomBytes(4).toString('hex') + (EXT[file.mimetype] || '.jpg');
  await fs.promises.writeFile(path.join(UPLOADS, name), file.buffer);
  return { url: '/uploads/' + name, publicId: '' };
}

// delete the old photo of a product (Cloudinary or local), never throws
async function deleteImage(product) {
  if (!product?.image) return;
  try {
    if (product.imagePublicId && cloudReady()) {
      configure();
      await cloudinary.uploader.destroy(product.imagePublicId);
    } else if (product.image.startsWith('/uploads/')) {
      await fs.promises.unlink(path.join(__dirname, '..', product.image));
    }
  } catch { /* ignore */ }
}

module.exports = { saveImage, deleteImage, cloudReady };
