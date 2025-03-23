// src/components/FileUploader.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useFileStore } from '../store/fileStore';
import ErrorAlert from './ErrorAlert';

interface FileUploaderProps {
  onUploadComplete?: () => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onUploadComplete }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  
  const { beginUpload, uploadFile, checkUploadProgress } = useFileStore();
  
  useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
    };
  }, []);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      resetState();
    }
  };
  
  const resetState = () => {
    setError(null);
    setSuccess(false);
    setProgress(0);
    setStatus('');
    setUploadId(null);
    
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  };
  
  const startProgressPolling = (id: string) => {
    checkProgress(id);
    progressInterval.current = setInterval(() => {
      checkProgress(id);
    }, 1000);
  };
  
  const checkProgress = async (id: string) => {
    try {
      const progressData = await checkUploadProgress(id);
      
      setProgress(progressData.progress);
      setStatus(progressData.status);
      
      if (progressData.status === 'completed' || progressData.status === 'failed') {
        if (progressInterval.current) {
          clearInterval(progressInterval.current);
          progressInterval.current = null;
        }
        
        if (progressData.status === 'completed') {
          setSuccess(true);
          onUploadComplete?.();
        } else {
          setError(progressData.error || 'Upload failed');
        }
        
        setUploading(false);
      }
    } catch (err) {
      console.error('Error checking progress:', err);
      setError('Failed to check upload progress');
      
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
      
      setUploading(false);
    }
  };
  
  const handleUpload = async () => {
    if (!selectedFile) return;
    
    try {
      setUploading(true);
      resetState();
      setStatus('pending');
      
      const id = await beginUpload(selectedFile.name);
      setUploadId(id);
      
      startProgressPolling(id);
      await uploadFile(selectedFile, id);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload file');
      setUploading(false);
      
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
    }
  };
  
  const resetUpload = () => {
    setSelectedFile(null);
    resetState();
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const getStatusMessage = () => {
    switch (status) {
      case 'pending':
        return 'Preparing upload...';
      case 'uploading':
        return `Uploading: ${progress}%`;
      case 'processing':
        return 'Processing file...';
      case 'completed':
        return 'Upload complete!';
      case 'failed':
        return `Upload failed: ${error}`;
      default:
        return '';
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      setSelectedFile(files[0]);
      resetState();
    }
  };

  return (
    <div className="space-y-6">
      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}
      
      <div 
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
          isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : uploading 
              ? 'border-gray-300 bg-gray-50 cursor-not-allowed' 
              : 'border-gray-300 hover:border-blue-500 cursor-pointer'
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          type="file"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
          id="file-input"
          ref={fileInputRef}
        />
        <label
          htmlFor="file-input"
          className="flex flex-col items-center cursor-pointer"
        >
          <svg className="w-12 h-12 text-blue-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <span className="text-lg font-medium text-gray-900 mb-2">
            {isDragging ? 'Drop your file here' : 'Drag & drop your file here'}
          </span>
          <span className="text-sm text-gray-500">or click to browse</span>
        </label>
        
        {selectedFile && (
          <div className="mt-4 text-sm text-gray-700 flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>
              {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
            </span>
          </div>
        )}
      </div>
      
      {uploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>{getStatusMessage()}</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      
      <div className="flex justify-end space-x-4">
        <button
          onClick={resetUpload}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className={`px-4 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            !selectedFile || uploading
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {uploading ? 'Uploading...' : 'Upload File'}
        </button>
      </div>
    </div>
  );
};

export default FileUploader;