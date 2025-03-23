// src/components/FileViewer.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFileStore } from '../store/fileStore';
import fileService from '../services/api';
import LoadingSpinner from './ui/LoadingSpinner';
import ErrorAlert from './ErrorAlert';
import { formatBytes } from '../utils/formatBytes';
import { formatDate } from '../utils/formatDate';
import { getFileIcon } from '../utils/getFileIcon';

const FileViewer: React.FC = () => {
  const { fileId } = useParams<{ fileId: string }>();
  const navigate = useNavigate();
  const { getFileDetails, loading, error, currentFile, clearError } = useFileStore();
  const [viewUrl, setViewUrl] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (fileId) {
      const fetchFile = async () => {
        try {
          const file = await getFileDetails(fileId);
          
          // Get the file URL
          const url = fileService.getDownloadUrl(file.id);
          
          // For images, create a blob URL
          if (file.mimeType.startsWith('image/')) {
            try {
              const response = await fetch(url);
              if (!response.ok) throw new Error('Failed to fetch image');
              const blob = await response.blob();
              const blobUrl = URL.createObjectURL(blob);
              setViewUrl(blobUrl);
              
              // Cleanup blob URL when component unmounts
              return () => URL.revokeObjectURL(blobUrl);
            } catch (err) {
              console.error('Error creating image preview:', err);
              setViewUrl(null);
            }
          } else if (file.mimeType === 'application/pdf') {
            // For PDFs, use the direct URL
            setViewUrl(url);
          } else if (file.mimeType.startsWith('text/')) {
            // For text files, fetch and display content
            const response = await fetch(url);
            const text = await response.text();
            const blob = new Blob([text], { type: 'text/plain' });
            const blobUrl = URL.createObjectURL(blob);
            setViewUrl(blobUrl);
            return () => URL.revokeObjectURL(blobUrl);
          } else {
            // For other file types, try to display in iframe
            setViewUrl(url);
          }
        } catch (err) {
          console.error('Error fetching file:', err);
        }
      };
      
      fetchFile();
    }
  }, [fileId, getFileDetails]);

  const handleDownload = () => {
    if (currentFile) {
      const downloadUrl = fileService.getDownloadUrl(currentFile.id);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', currentFile.filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDelete = async () => {
    if (!currentFile) return;
    
    if (window.confirm('Are you sure you want to delete this file? This action cannot be undone.')) {
      try {
        setIsDeleting(true);
        await fileService.deleteFile(currentFile.id);
        navigate('/');
      } catch (err) {
        console.error('Error deleting file:', err);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorAlert message={error} onDismiss={clearError} />;
  }

  if (!currentFile) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="mx-auto w-12 h-12 text-gray-400 mb-4">
          <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">File not found</h2>
        <p className="text-gray-500 mb-6">
          The file you're looking for doesn't exist or has been deleted.
        </p>
        <button
          onClick={handleBack}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Back to Files
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleBack}
              className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              title="Back to files"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 text-gray-400">
                {React.cloneElement(getFileIcon(currentFile.mimeType), { className: 'w-full h-full' })}
              </div>
              <div>
                <h1 className="text-sm font-medium text-gray-900 truncate max-w-[300px]" title={currentFile.filename}>
                  {currentFile.filename}
                </h1>
                <p className="text-xs text-gray-500">
                  {formatBytes(currentFile.size)} • {formatDate(currentFile.uploadDate)}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              title="Download file"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Delete file"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* File Preview */}
      <div className="p-4">
        {viewUrl ? (
          currentFile.mimeType.startsWith('image/') ? (
            // Image preview
            <div className="flex justify-center bg-gray-50 rounded-lg p-4">
              <img 
                src={viewUrl} 
                alt={currentFile.filename} 
                className="max-w-full max-h-[600px] object-contain rounded-lg"
                onError={(e) => {
                  console.error('Error loading image:', e);
                  setViewUrl(null);
                }}
                crossOrigin="anonymous"
              />
            </div>
          ) : currentFile.mimeType === 'application/pdf' ? (
            // PDF preview
            <div className="w-full h-[600px] bg-gray-50 rounded-lg overflow-hidden">
              <iframe
                src={viewUrl}
                className="w-full h-full"
                title={currentFile.filename}
              />
            </div>
          ) : currentFile.mimeType.startsWith('text/') ? (
            // Text file preview
            <div className="w-full h-[600px] bg-gray-50 rounded-lg overflow-auto p-4">
              <iframe
                src={viewUrl}
                className="w-full h-full border-0"
                title={currentFile.filename}
              />
            </div>
          ) : (
            // Other file types
            <div className="w-full h-[600px] bg-gray-50 rounded-lg overflow-hidden">
              <iframe
                src={viewUrl}
                className="w-full h-full"
                title={currentFile.filename}
              />
            </div>
          )
        ) : (
          // Fallback view
          <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
            <div className="w-24 h-24 text-gray-400 mb-4">
              {React.cloneElement(getFileIcon(currentFile.mimeType), { className: 'w-full h-full' })}
            </div>
            <p className="text-gray-500 text-center">
              Preview not available for this file type
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileViewer;