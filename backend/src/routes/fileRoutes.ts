// backend/src/routes/fileRoutes.ts
import express from 'express';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import * as fileController from '../controllers/fileController';
import * as progressController from '../controllers/progressController';
import { fileFilter } from '../middleware/fileValidation';
import { s3Client, bucketName } from '../utils/s3Service';

const router = express.Router();

// Configure multer storage with S3
const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: bucketName,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      // Generate a unique filename with original extension
      const fileExtension = path.extname(file.originalname);
      const filename = `${uuidv4()}${fileExtension}`;
      cb(null, filename);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE // Auto-detect content type
  }),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB file size limit
  },
  fileFilter
});

// File upload routes
router.post('/begin', fileController.beginUpload);
router.post('/', upload.single('file'), fileController.uploadFile);

// File access routes
router.get('/', fileController.getAllFiles);
router.get('/:id', fileController.downloadFile);
router.get('/:id/details', fileController.getFileDetails);
router.delete('/:id', fileController.deleteFile); // Add this line

// Progress tracking route
router.get('/progress/:id', progressController.getUploadProgress);

export default router;