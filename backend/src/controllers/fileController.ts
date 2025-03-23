import { Request, Response, NextFunction } from 'express';
import File from '../models/File';
import { IFileResponse, IPaginationResponse, IFileListResponse } from '../types/file';
import { 
  startUpload, 
  updateProgress, 
  completeUpload, 
  failUpload 
} from '../services/progressTracker';
import { deleteFileFromS3, bucketName, getPresignedUrl } from '../utils/s3Service';

/**
 * Initialize file upload tracking
 * @route POST /api/files/begin
 */
export const beginUpload = (req: Request, res: Response): void => {
  const { filename } = req.body;
  
  if (!filename) {
    res.status(400).json({ error: 'Filename is required' });
    return;
  }
  
  // Start tracking this upload
  const uploadId = startUpload(filename);
  
  res.status(200).json({ 
    uploadId,
    message: 'Upload tracking initialized'
  });
};

/**
 * Upload a file
 * @route POST /api/files
 */
export const uploadFile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const uploadId = req.body.uploadId || '';
  
  try {
    if (!req.file) {
      if (uploadId) {
        failUpload(uploadId, 'No file uploaded');
      }
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    // For multer-s3, the file object has a different structure
    const file = req.file as Express.MulterS3.File;
    
    // If no upload ID was provided, create one now
    const trackingId = uploadId || startUpload(file.originalname);
    
    // Update progress to indicate file has been received by server
    // and uploaded to S3 (thanks to multer-s3)
    updateProgress(trackingId, 50);
    
    // Create a new file record in the database
    const newFile = new File({
      filename: file.key,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      s3Key: file.key,
      s3Bucket: bucketName,
      uploadId: trackingId
    });

    // Save to database
    await newFile.save();
    
    // Update progress to processing stage (metadata saved)
    updateProgress(trackingId, 90);
    
    // Any additional processing would happen here
    
    // Mark upload as complete
    completeUpload(trackingId);

    // Create response object
    const fileResponse: IFileResponse = {
      id: newFile.id,
      filename: newFile.originalName,
      mimeType: newFile.mimeType,
      size: newFile.size,
      uploadDate: newFile.uploadDate,
      uploadId: trackingId
    };

    res.status(201).json({
      message: 'File uploaded successfully',
      file: fileResponse
    });
  } catch (error) {
    // Mark upload as failed if we have an ID
    if (uploadId) {
      failUpload(uploadId, error instanceof Error ? error.message : 'Upload failed');
    }
    
    // If an error occurs, try to delete the uploaded file from S3
    if (req.file) {
      try {
        const file = req.file as Express.MulterS3.File;
        await deleteFileFromS3(file.key);
      } catch (deleteError) {
        console.error('Error deleting file from S3:', deleteError);
      }
    }
    next(error);
  }
};

/**
 * Get all files with pagination
 * @route GET /api/files
 */
export const getAllFiles = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Parse pagination parameters
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await File.countDocuments();

    // Get files with pagination
    const files = await File.find()
      .sort({ uploadDate: -1 })
      .skip(skip)
      .limit(limit);

    // Map to response format
    const fileResponses: IFileResponse[] = files.map(file => ({
      id: file.id,
      filename: file.originalName,
      mimeType: file.mimeType,
      size: file.size,
      uploadDate: file.uploadDate
    }));

    // Create pagination object
    const pagination: IPaginationResponse = {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    };

    // Assemble final response
    const response: IFileListResponse = {
      files: fileResponses,
      pagination
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Download a file
 * @route GET /api/files/:id
 */
export const downloadFile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    // Generate a presigned URL for downloading
    const presignedUrl = await getPresignedUrl(file.s3Key);

    // Redirect to the presigned URL (client directly downloads from S3)
    res.redirect(presignedUrl);
    
  } catch (error) {
    next(error);
  }
};

/**
 * View file details
 * @route GET /api/files/:id/details
 */
export const getFileDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    // Generate a temporary view URL if needed
    const viewUrl = await getPresignedUrl(file.s3Key, 600); // 10 minutes

    const fileResponse: IFileResponse & { viewUrl?: string } = {
      id: file.id,
      filename: file.originalName,
      mimeType: file.mimeType,
      size: file.size,
      uploadDate: file.uploadDate,
      viewUrl: file.mimeType.startsWith('image/') ? viewUrl : undefined // Only provide viewUrl for images
    };

    res.status(200).json(fileResponse);
  } catch (error) {
    next(error);
  }
};

export const deleteFile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    // Delete from S3
    await deleteFileFromS3(file.s3Key);

    // Delete from database
    await file.deleteOne();

    res.status(200).json({ message: 'File deleted successfully' });
  } catch (error) {
    next(error);
  }
};