export interface FileMetadata {
    id: string;
    filename: string;
    mimeType: string;
    size: number;
    uploadDate: string;
    uploadId?: string;
  }
  
  export interface Pagination {
    total: number;
    page: number;
    limit: number;
    pages: number;
  }
  
  export interface FileListResponse {
    files: FileMetadata[];
    pagination: Pagination;
  }
  
  export interface UploadProgress {
    id: string;
    filename: string;
    progress: number;
    status: 'pending' | 'uploading' | 'processing' | 'completed' | 'failed';
    error?: string;
    startTime: string;
    lastUpdate: string;
  }
  
  export interface FileUploadResponse {
    message: string;
    file: FileMetadata;
  }