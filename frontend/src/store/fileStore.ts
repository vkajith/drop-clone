import { create } from 'zustand';
import fileService from '../services/api';
import { FileMetadata, Pagination, UploadProgress } from '../types/file';

interface FileState {
  // State
  files: FileMetadata[];
  pagination: Pagination;
  currentFile: FileMetadata | null;
  loading: boolean;
  error: string | null;
  
  // File listing actions
  fetchFiles: (page?: number, limit?: number) => Promise<void>;
  getFileDetails: (fileId: string) => Promise<FileMetadata>;
  clearError: () => void;
  
  // Upload tracking actions
  beginUpload: (filename: string) => Promise<string>;
  uploadFile: (file: File, uploadId: string) => Promise<void>;
  checkUploadProgress: (uploadId: string) => Promise<UploadProgress>;
}

const defaultPagination: Pagination = {
  total: 0,
  page: 1,
  limit: 10,
  pages: 0
};

export const useFileStore = create<FileState>((set, get) => ({
  // Initial state
  files: [],
  pagination: defaultPagination,
  currentFile: null,
  loading: false,
  error: null,
  
  // File listing actions
  fetchFiles: async (page = 1, limit = 10) => {
    set({ loading: true, error: null });
    try {
      const response = await fileService.getFiles(page, limit);
      set({ 
        files: response.files, 
        pagination: response.pagination,
        loading: false
      });
    } catch (err) {
      set({ 
        error: 'Failed to fetch files',
        loading: false
      });
      console.error(err);
    }
  },
  
  getFileDetails: async (fileId: string) => {
    set({ loading: true, error: null });
    try {
      const file = await fileService.getFileDetails(fileId);
      set({ currentFile: file, loading: false });
      return file;
    } catch (err) {
      set({ 
        error: 'Failed to get file details',
        loading: false
      });
      console.error(err);
      throw err;
    }
  },
  
  clearError: () => set({ error: null }),
  
  // Upload tracking actions
  beginUpload: async (filename: string) => {
    try {
      return await fileService.beginUpload(filename);
    } catch (err) {
      set({ error: 'Failed to begin upload' });
      console.error(err);
      throw err;
    }
  },
  
  uploadFile: async (file: File, uploadId: string) => {
    try {
      await fileService.uploadFile(file, uploadId);
      // After successful upload, refresh the file list
      const { fetchFiles } = get();
      await fetchFiles(1);
    } catch (err) {
      set({ error: 'Failed to upload file' });
      console.error(err);
      throw err;
    }
  },
  
  checkUploadProgress: async (uploadId: string) => {
    try {
      return await fileService.getUploadProgress(uploadId);
    } catch (err) {
      console.error('Error checking progress:', err);
      throw err;
    }
  }
}));