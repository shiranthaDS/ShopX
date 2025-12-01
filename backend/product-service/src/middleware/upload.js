import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Store uploads in a stable path under the product service working directory
// Using process.cwd() which is backend/product-service when running scripts from there
const uploadsRoot = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsRoot)) fs.mkdirSync(uploadsRoot, { recursive: true });

const allowed = (process.env.ALLOWED_IMAGE_TYPES || 'jpg,jpeg,png,webp')
  .split(',')
  .map(t => t.trim().toLowerCase())
  .filter(Boolean);

const maxSizeMb = parseInt(process.env.MAX_IMAGE_SIZE_MB || '5', 10);
const maxFiles = parseInt(process.env.MAX_IMAGE_FILES || '5', 10);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsRoot),
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, unique + ext);
  },
});

const fileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname).slice(1).toLowerCase();
  if (!allowed.includes(ext)) {
    return cb(new Error('Unsupported file type'));
  }
  cb(null, true);
};

export const uploadImages = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxSizeMb * 1024 * 1024, files: maxFiles },
}).array('images', maxFiles);

export const publicImageUrl = (filename) => {
  const base = process.env.PUBLIC_BASE_URL || '';
  const pathUrl = `/uploads/${filename}`;
  return base ? `${base}${pathUrl}` : pathUrl;
};

export const uploadsPath = uploadsRoot;
