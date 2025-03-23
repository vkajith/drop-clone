import mongoose, { Schema } from 'mongoose';
import { IFile } from '../types/file';

const fileSchema = new Schema<IFile>(
  {
    filename: {
      type: String,
      required: true,
      trim: true
    },
    originalName: {
      type: String,
      required: true,
      trim: true
    },
    mimeType: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    s3Key: {
      type: String,
      required: true
    },
    s3Bucket: {
      type: String,
      required: true
    },
    // Add upload ID field
    uploadId: {
      type: String,
      required: true,
      index: true // Add an index for faster lookups
    },
    uploadDate: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Create indexes for faster queries
fileSchema.index({ filename: 1 });
fileSchema.index({ uploadDate: -1 });

const File = mongoose.model<IFile>('File', fileSchema);

export default File;