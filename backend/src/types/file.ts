import { Document } from 'mongoose';

// Interface for the File document in MongoDB
export interface IFile extends Document {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  s3Key: string;
  s3Bucket: string;
  uploadId: string; // Add this field for tracking upload progress
  uploadDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

// The rest of your existing interface definitions...
export interface IFileResponse {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  uploadDate: Date;
  uploadId?: string; // Include this in responses
}

// Interface for pagination response
export interface IPaginationResponse {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// Interface for the file list response
export interface IFileListResponse {
  files: IFileResponse[];
  pagination: IPaginationResponse;
}