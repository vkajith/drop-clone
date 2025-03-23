// src/services/api.ts
import axios from 'axios';
import { FileMetadata, FileListResponse, UploadProgress, FileUploadResponse } from '../types/file';

// Define API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// API endpoints
const fileService = {
  // Begin tracking an upload
  beginUpload: async (filename: string): Promise<string> => {
    const response = await api.post('/files/begin', { filename });
    return response.data.uploadId;
  },

  // Upload a file
  uploadFile: async (file: File, uploadId: string): Promise<FileUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('uploadId', uploadId);

    const response = await api.post('/files', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  },

  // Get upload progress
  getUploadProgress: async (uploadId: string): Promise<UploadProgress> => {
    const response = await api.get(`/files/progress/${uploadId}`);
    return response.data;
  },

  // Get all files with pagination
  getFiles: async (page = 1, limit = 10): Promise<FileListResponse> => {
    const response = await api.get('/files', {
      params: { page, limit }
    });
    return response.data;
  },

  // Get file details
  getFileDetails: async (fileId: string): Promise<FileMetadata> => {
    const response = await api.get(`/files/${fileId}/details`);
    return response.data;
  },

  // Get download URL
  getDownloadUrl: (fileId: string): string => {
    // Make sure API_BASE_URL is defined
    if (!API_BASE_URL) {
      throw new Error('API_BASE_URL is not defined');
    }
    return `${API_BASE_URL}/files/${fileId}`;
  },

  deleteFile: async (fileId: string): Promise<void> => {
    await api.delete(`/files/${fileId}`);
  }
};

export default fileService;