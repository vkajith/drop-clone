// src/components/FileItem.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { formatBytes } from '../utils/formatBytes';
import { formatDate } from '../utils/formatDate';
import { getFileIcon } from '../utils/getFileIcon';
import { FileMetadata } from '../types/file';

interface FileItemProps {
  file: FileMetadata;
  viewMode: 'grid' | 'list';
}

const FileItem: React.FC<FileItemProps> = ({ file, viewMode }) => {
  const fileIcon = getFileIcon(file.mimeType);

  if (viewMode === 'grid') {
    return (
      <Link
        to={`/files/${file.id}`}
        className="group bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow duration-200"
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 mb-4 text-gray-400 group-hover:text-blue-500 transition-colors duration-200">
            {React.cloneElement(fileIcon, { className: 'w-full h-full' })}
          </div>
          <h3 className="text-sm font-medium text-gray-900 truncate w-full" title={file.filename}>
            {file.filename}
          </h3>
          <div className="mt-2 text-xs text-gray-500">
            <span>{formatBytes(file.size)}</span>
            <span className="mx-1">•</span>
            <span>{formatDate(file.uploadDate)}</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/files/${file.id}`}
      className="group flex items-center px-4 py-3 hover:bg-gray-50 transition-colors duration-200"
    >
      <div className="flex-shrink-0 w-10 h-10 text-gray-400 group-hover:text-blue-500 transition-colors duration-200">
        {React.cloneElement(fileIcon, { className: 'w-full h-full' })}
      </div>
      <div className="flex-grow min-w-0 ml-4">
        <h3 className="text-sm font-medium text-gray-900 truncate" title={file.filename}>
          {file.filename}
        </h3>
        <div className="flex items-center mt-1 text-xs text-gray-500">
          <span>{formatBytes(file.size)}</span>
          <span className="mx-2">•</span>
          <span>{formatDate(file.uploadDate)}</span>
        </div>
      </div>
      <div className="flex-shrink-0 ml-4 text-gray-400 group-hover:text-blue-500 transition-colors duration-200">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
};

export default FileItem;