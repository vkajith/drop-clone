// src/utils/s3Service.ts
import { S3Client, DeleteObjectCommand, GetObjectCommand, S3ClientConfig } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { AwsCredentialIdentity } from '@aws-sdk/types';
import config from './config';

// Initialize S3 client with the configuration
let s3ClientOptions : S3ClientConfig = {
  region: config.aws.region,
};

// Only add credentials if they exist
if (config.aws.credentials) {
  // This cast tells TypeScript that our credentials match the expected AWS type
  s3ClientOptions = {
    ...s3ClientOptions,
    credentials: config.aws.credentials as Required<AwsCredentialIdentity>
  };
}

const s3Client = new S3Client(s3ClientOptions);

// S3 bucket name from config
const bucketName = config.aws.s3Bucket;

/**
 * Generate a presigned URL for downloading a file from S3
 * @param key - The S3 object key
 * @param expiresIn - URL expiration time in seconds (default: 3600 seconds = 1 hour)
 * @returns A presigned URL that allows temporary access to the object
 */
export const getPresignedUrl = async (key: string, expiresIn = 3600): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key
  });
  
  return getSignedUrl(s3Client, command, { expiresIn });
};

/**
 * Delete a file from S3
 * @param key - The S3 object key to delete
 */
export const deleteFileFromS3 = async (key: string): Promise<void> => {
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key
  });
  
  await s3Client.send(command);
};

export { s3Client, bucketName };