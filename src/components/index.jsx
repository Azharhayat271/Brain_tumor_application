import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowUpTrayIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { HeartPulse } from 'lucide-react';

const BrainTumorPrediction = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    setResponse(null);
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select an image!');
      return;
    }

    const formData = new FormData();
    formData.append('fileUploadedByUser', file);

    try {
      setLoading(true);
      const res = await axios.post('https://som11-multiclass-brain-tumor-classification.hf.space/predict', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setResponse(res.data);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex justify-center mb-4"
          >
            <HeartPulse className="h-16 w-16 text-blue-600" />
          </motion.div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Brain Tumor Detection</h1>
          <p className="text-xl text-gray-600">Upload MRI scan for instant analysis</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6 h-fit">
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 transition-colors">
              <label htmlFor="file-upload" className="cursor-pointer">
                <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">Drag and drop or click to upload</p>
                <p className="text-sm text-gray-500">Supports: JPEG, PNG (Max 5MB)</p>
                <input
                  type="file"
                  id="file-upload"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {preview && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 relative group"
              >
                <img
                  src={preview}
                  alt="Preview"
                  className="rounded-lg object-cover w-full h-48 shadow-md"
                />
                <button
                  onClick={removeFile}
                  className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-sm hover:bg-gray-100 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6 text-gray-600" />
                </button>
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleUpload}
              disabled={!file || loading}
              className={`w-full mt-6 py-3 rounded-xl text-white font-medium transition-colors ${
                !file || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Analyzing...</span>
                </div>
              ) : (
                'Start Analysis'
              )}
            </motion.button>
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            {response ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-6 rounded-xl ${
                  response.predicted_result === 'Positive' 
                    ? 'bg-red-50 border border-red-200'
                    : 'bg-green-50 border border-green-200'
                }`}
              >
                <h3 className="text-2xl font-semibold mb-4 flex items-center">
                  {/* <HeartPulseIcon className={`h-8 w-8 mr-2 ${
                    response.predicted_result === 'Positive' ? 'text-red-600' : 'text-green-600'
                  }`} /> */}
                  Analysis Results
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-600">Diagnosis</label>
                    <div className={`text-xl font-semibold ${
                      response.predicted_result === 'Positive' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {response.predicted_result === 'Positive' ? 'Tumor Detected' : 'No Tumor Found'}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-600">Confidence Level</label>
                    <div className="flex items-center space-x-2">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${
                            response.predicted_result === 'Positive' ? 'bg-red-600' : 'bg-green-600'
                          }`}
                          style={{ width: `${response.confidence}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {Math.round(response.confidence)}%
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-600">Recommendation</label>
                    <p className="text-gray-800">
                      {response.message || 'Consult a medical professional for further evaluation.'}
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="text-center p-8 text-gray-500">
                <p className="text-lg">Analysis results will appear here</p>
                <p className="text-sm mt-2">Upload an MRI scan to begin diagnosis</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BrainTumorPrediction;