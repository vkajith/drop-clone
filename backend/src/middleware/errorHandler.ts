import { Request, Response, NextFunction } from 'express';

// Custom error interface with additional properties
interface AppError extends Error {
  status?: number;
  code?: number | string;
  keyPattern?: object;
  keyValue?: object;
  errors?: { [key: string]: any };
  kind?: string;
  $metadata?: {
    httpStatusCode: number;
  };
}

/**
 * Global error handling middleware
 */
const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', err);

  // Default error status and message
  const status = err.status || err.$metadata?.httpStatusCode || 500;
  const message = err.message || 'Something went wrong';

  // Handle different error types
  if (err.name === 'ValidationError') {
    // Mongoose validation error
    res.status(400).json({
      error: 'Validation Error',
      details: err.message
    });
    return;
  }

  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    // Invalid MongoDB ObjectId
    res.status(400).json({
      error: 'Invalid ID',
      details: 'The specified ID is not valid'
    });
    return;
  }

  if (err.code === 11000) {
    // MongoDB duplicate key error
    res.status(409).json({
      error: 'Duplicate Error',
      details: 'A record with this information already exists'
    });
    return;
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    res.status(400).json({
      error: 'File Too Large',
      details: 'The uploaded file exceeds the size limit'
    });
    return;
  }

  // AWS S3 errors
  if (err.name?.includes('S3') || err.name?.includes('AWS')) {
    res.status(status).json({
      error: 'Storage Error',
      details: process.env.NODE_ENV === 'production' 
        ? 'An error occurred with the file storage service' 
        : message
    });
    return;
  }

  // Handle all other errors
  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export default errorHandler;