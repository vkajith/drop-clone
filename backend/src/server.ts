// src/server.ts
import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';


import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

// Import configuration
import config from './utils/config';

// Import routes
import fileRoutes from './routes/fileRoutes';

// Import middleware
import errorHandler from './middleware/errorHandler';

// Initialize express app
const app = express();
const PORT = config.server.port;

// Connect to MongoDB
mongoose.connect(config.db.uri)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

// Apply security headers
app.use(helmet());

// Rate limiting to prevent abuse
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api', apiLimiter);

// Middleware
// Configure CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'your-production-domain.com' 
    : ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(config.server.isDevelopment ? 'dev' : 'combined')); // Use more detailed logging in development

// Routes
app.use('/api/files', fileRoutes);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'UP',
    environment: config.server.nodeEnv,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running in ${config.server.nodeEnv} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled Rejection:', err);
});

export default app;