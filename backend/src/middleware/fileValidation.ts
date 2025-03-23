import { Request } from 'express';
import multer from 'multer';

// Define allowed file types with their corresponding extensions
interface AllowedFileTypes {
  [key: string]: string[];
}

const ALLOWED_FILE_TYPES: AllowedFileTypes = {
  // Images
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  // Documents
  'application/pdf': ['.pdf'],
  'text/plain': ['.txt'],
  'application/json': ['.json'],
  // Other common formats
  'application/zip': ['.zip']
};

// File filter function for multer to validate uploads
export const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback
): void => {
  // Check if the MIME type is allowed
  const isAllowedMimeType = Object.keys(ALLOWED_FILE_TYPES).includes(file.mimetype);
  
  if (!isAllowedMimeType) {
    const error = new Error('File type not allowed') as any;
    error.status = 400;
    return callback(error, false);
  }
  
  // Get the file extension
  const fileExtMatch = file.originalname.toLowerCase().match(/\.[0-9a-z]+$/);
  if (!fileExtMatch) {
    const error = new Error('Invalid file name') as any;
    error.status = 400;
    return callback(error, false);
  }
  
  const fileExtension = fileExtMatch[0];
  
  // Check if the extension matches the allowed extensions for this MIME type
  const isAllowedExtension = ALLOWED_FILE_TYPES[file.mimetype].includes(fileExtension);
  
  if (!isAllowedExtension) {
    const error = new Error('File extension does not match content type') as any;
    error.status = 400;
    return callback(error, false);
  }
  
  // Accept the file
  callback(null, true);
};