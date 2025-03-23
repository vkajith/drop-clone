# Dropbox Clone

A modern, full-stack file storage application built with React, Node.js, and AWS S3.

## Features

- 📁 File upload and download
- 🖼️ Image preview
- 📄 Text file preview
- 📊 PDF preview
- 🔍 File search and filtering
- 📱 Responsive design
- 🔒 Secure file handling
- 📈 Upload progress tracking
- 🎨 Modern UI with Tailwind CSS

## Tech Stack

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- Zustand (State Management)
- React Router v6
- Axios

### Backend
- Node.js
- Express
- TypeScript
- AWS S3
- Multer
- MongoDB

## Prerequisites

- Node.js (v16 or higher)
- MongoDB
- AWS Account with S3 bucket
- npm or yarn

## Environment Variables

### Backend
```env
PORT=5000
MONGODB_URI=your_mongodb_uri
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
AWS_BUCKET_NAME=your_bucket_name
```

### Frontend
```env
REACT_APP_API_URL=http://localhost:5000
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/vkajith/drop-clone.git
cd drop-clone
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

4. Set up environment variables:
- Copy `.env.example` to `.env` in both backend and frontend directories
- Fill in your environment variables

## Running the Application

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend development server:
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Project Structure

```
drop-clone/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   ├── types/
│   │   └── utils/
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [AWS S3](https://aws.amazon.com/s3/)
- [MongoDB](https://www.mongodb.com/) 