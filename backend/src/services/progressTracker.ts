import { randomUUID } from 'crypto';

export interface UploadProgress {
  id: string;
  filename: string;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'failed';
  error?: string;
  startTime: Date;
  lastUpdate: Date;
}

// In a production environment, you would use Redis or a database
// For this implementation, we'll use an in-memory store
const progressMap = new Map<string, UploadProgress>();

// Clean up old records (every hour)
setInterval(() => {
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  
  for (const [id, progress] of progressMap.entries()) {
    if (progress.lastUpdate < oneDayAgo) {
      progressMap.delete(id);
    }
  }
}, 60 * 60 * 1000);

/**
 * Initialize tracking for a new file upload
 * @param filename Name of the file being uploaded
 * @returns Unique ID for tracking the upload
 */
export const startUpload = (filename: string): string => {
  const id = randomUUID();
  progressMap.set(id, {
    id,
    filename,
    progress: 0,
    status: 'pending',
    startTime: new Date(),
    lastUpdate: new Date()
  });
  return id;
};

/**
 * Update the progress of an ongoing upload
 * @param id The upload tracking ID
 * @param progress The current progress percentage (0-100)
 */
export const updateProgress = (id: string, progress: number): void => {
  const record = progressMap.get(id);
  if (record) {
    record.progress = progress;
    record.status = progress < 100 ? 'uploading' : 'processing';
    record.lastUpdate = new Date();
    progressMap.set(id, record);
  }
};

/**
 * Mark an upload as successfully completed
 * @param id The upload tracking ID
 */
export const completeUpload = (id: string): void => {
  const record = progressMap.get(id);
  if (record) {
    record.progress = 100;
    record.status = 'completed';
    record.lastUpdate = new Date();
    progressMap.set(id, record);
  }
};

/**
 * Mark an upload as failed with an error message
 * @param id The upload tracking ID
 * @param error The error message
 */
export const failUpload = (id: string, error: string): void => {
  const record = progressMap.get(id);
  if (record) {
    record.status = 'failed';
    record.error = error;
    record.lastUpdate = new Date();
    progressMap.set(id, record);
  }
};

/**
 * Get the current progress of an upload
 * @param id The upload tracking ID
 * @returns The upload progress record, or undefined if not found
 */
export const getProgress = (id: string): UploadProgress | undefined => {
  return progressMap.get(id);
};