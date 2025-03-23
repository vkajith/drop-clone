// src/components/FileList.tsx
import React, { useEffect } from 'react';
import FileItem from './FileItem';
import LoadingSpinner from './ui/LoadingSpinner';
import Pagination from './Pagination';
import ErrorAlert from './ErrorAlert';
import { useFileStore } from '../store/fileStore';

interface FileListProps {
  viewMode: 'grid' | 'list';
}

const FileList: React.FC<FileListProps> = ({ viewMode }) => {
  const { files, pagination, loading, error, fetchFiles, clearError } = useFileStore();

  // Fetch files on component mount
  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handlePageChange = (page: number) => {
    fetchFiles(page, pagination.limit);
  };

  if (loading && files.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-4">
      {error && <ErrorAlert message={error} onDismiss={clearError} />}
      
      {files.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="mx-auto w-12 h-12 text-gray-400 mb-4">
            <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No files yet</h2>
          <p className="text-gray-500 mb-6">
            Upload your first file to get started.
          </p>
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' 
          : 'bg-white rounded-lg shadow-sm divide-y divide-gray-200'
        }>
          {files.map((file) => (
            <FileItem key={file.id} file={file} viewMode={viewMode} />
          ))}
        </div>
      )}
      
      {pagination.pages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default FileList;