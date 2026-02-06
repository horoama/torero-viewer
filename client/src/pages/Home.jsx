import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const Home = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await axios.get('/api/files');
      setFiles(response.data);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      fetchFiles();
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
      event.target.value = null; // Reset input
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Trello JSON Viewer</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Upload New Board</h2>
          <div className="flex items-center space-x-4">
            <label className="flex flex-col items-center px-4 py-2 bg-blue-500 text-white rounded-lg shadow-lg tracking-wide uppercase border border-blue cursor-pointer hover:bg-blue-600">
                <span className="mt-2 text-base leading-normal">{uploading ? 'Uploading...' : 'Select JSON File'}</span>
                <input type='file' className="hidden" accept=".json,.txt" onChange={handleFileUpload} disabled={uploading} />
            </label>
            <span className="text-gray-500 text-sm">Supported formats: .json, .txt (Trello export)</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Saved Boards</h2>
          {files.length === 0 ? (
            <p className="text-gray-500">No boards found. Upload one to get started.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {files.map((file) => (
                <li key={file.filename} className="py-4 flex justify-between items-center hover:bg-gray-50 px-2 rounded transition">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{file.name || file.filename.split('-').slice(1).join('-')}</span>
                    <span className="text-sm text-gray-500">Uploaded: {format(new Date(file.uploadedAt), 'PPP p')}</span>
                  </div>
                  <Link
                    to={`/board/${file.filename}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                  >
                    View Board
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
