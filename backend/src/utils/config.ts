import * as dotenvFlow from 'dotenv-flow';
import { z } from 'zod';

// Load environment variables based on NODE_ENV
dotenvFlow.config();

// Define schema for environment variables with validation
const envSchema = z.object({
  // Server configuration
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  
  // Database
  MONGODB_URI: z.string().url(),
  
  // AWS configuration
  AWS_REGION: z.string().min(1),
  S3_BUCKET_NAME: z.string().min(1),
  
  // AWS credentials - optional in development/test
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
});

// Parse and validate environment variables
const env = envSchema.parse(process.env);

// Define schema for our config object with proper types
const configSchema = z.object({
  server: z.object({
    port: z.number(),
    nodeEnv: z.enum(['development', 'test', 'production']),
    isDevelopment: z.boolean(),
    isTest: z.boolean(),
    isProduction: z.boolean(),
  }),
  
  db: z.object({
    uri: z.string().url(),
  }),
  
  aws: z.object({
    region: z.string(),
    s3Bucket: z.string(),
    credentials: z.object({
      accessKeyId: z.string(),
      secretAccessKey: z.string(),
    }).optional(),
  }),
  
  fileUpload: z.object({
    maxSize: z.number(),
  }),
});

// Create our strongly-typed config object
const config = configSchema.parse({
  server: {
    port: parseInt(env.PORT, 10),
    nodeEnv: env.NODE_ENV,
    isDevelopment: env.NODE_ENV === 'development',
    isTest: env.NODE_ENV === 'test',
    isProduction: env.NODE_ENV === 'production',
  },
  
  db: {
    uri: env.MONGODB_URI,
  },
  
  aws: {
    region: env.AWS_REGION,
    s3Bucket: env.S3_BUCKET_NAME,
    // Only include credentials if both are provided
    ...(env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY ? {
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      }
    } : {}),
  },
  
  fileUpload: {
    maxSize: 10 * 1024 * 1024, // 10MB default
  },
});

// Log config in development (excluding sensitive data)
if (config.server.isDevelopment) {
  const safeConfig = {
    ...config,
    aws: { 
      region: config.aws.region,
      s3Bucket: config.aws.s3Bucket,
      hasCredentials: !!config.aws.credentials
    }
  };
  console.log('Application configuration:', safeConfig);
}

export default config;