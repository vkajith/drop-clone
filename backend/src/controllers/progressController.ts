import { Request, Response } from 'express';
import { getProgress } from '../services/progressTracker';

/**
 * Get the progress of a file upload
 * @route GET /api/files/progress/:id
 */
export const getUploadProgress = (req: Request, res: Response): void => {
  const { id } = req.params;
  
  if (!id) {
    res.status(400).json({ error: 'Upload ID is required' });
    return;
  }
  
  const progress = getProgress(id);
  
  if (!progress) {
    res.status(404).json({ error: 'Upload not found' });
    return;
  }
  
  res.status(200).json(progress);
};