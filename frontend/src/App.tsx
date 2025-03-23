// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useFileStore } from './store/fileStore';
import HomePage from './pages/HomePage';
import FileViewPage from './pages/FileViewPage';
import NotFoundPage from './pages/NotFoundPage';
import Layout from './components/Layout';

function App() {
  // Initialize store on app load
  const { fetchFiles } = useFileStore();
  
  React.useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);
  
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/files/:fileId" element={<FileViewPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;