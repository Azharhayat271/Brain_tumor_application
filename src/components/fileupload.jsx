import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const FileUpload = ({ setLoading, setResponse }) => {
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setImagePreview(URL.createObjectURL(selectedFile)); // For image preview
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select an image!');
      return;
    }

    const formData = new FormData();
    formData.append('fileUploadedByUser', file);

    setLoading(true);

    try {
      const res = await axios.post('YOUR_API_URL', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setLoading(false);
      setResponse(res.data);
    } catch (error) {
      setLoading(false);
      alert('Error uploading file');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-lg"
    >
      <div className="mb-4">
        <label htmlFor="file-upload" className="block text-xl font-semibold text-gray-700">
          Upload your Brain Scan Image
        </label>
        <input
          type="file"
          id="file-upload"
          accept="image/*"
          onChange={handleFileChange}
          className="mt-3 w-full border border-gray-300 rounded-md p-2"
        />
      </div>

      {imagePreview && (
        <div className="mb-4">
          <img src={imagePreview} alt="Preview" className="max-w-full rounded-md shadow-md" />
        </div>
      )}

      <motion.button
        onClick={handleUpload}
        className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary focus:outline-none transition ease-in-out duration-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
      >
        Upload Image
      </motion.button>
    </motion.div>
  );
};

export default FileUpload;
