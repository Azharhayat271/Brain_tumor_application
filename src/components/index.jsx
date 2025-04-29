import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowUpTrayIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Brain, BarChart3, FileImage } from 'lucide-react';
import { apiBaseUrl, segmentationModelBaseUrl } from '../../config';

const BrainTumorPrediction = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [segmentationLoading, setSegmentationLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [segmentationResult, setSegmentationResult] = useState(null);
  const [segmentationError, setSegmentationError] = useState(null);

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
      if (segmentationResult) URL.revokeObjectURL(segmentationResult);
    };
  }, [preview, segmentationResult]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Revoke previous URLs
      if (preview) URL.revokeObjectURL(preview);
      if (segmentationResult) URL.revokeObjectURL(segmentationResult);
      
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResponse(null);
      setSegmentationResult(null);
      setSegmentationError(null);
    }
  };

  const removeFile = () => {
    if (preview) URL.revokeObjectURL(preview);
    if (segmentationResult) URL.revokeObjectURL(segmentationResult);
    
    setFile(null);
    setPreview(null);
    setResponse(null);
    setSegmentationResult(null);
    setSegmentationError(null);
  };

  const handleSegmentation = async (file) => {
    try {
      setSegmentationLoading(true);
      setSegmentationError(null);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await axios.post(
        `${segmentationModelBaseUrl}/predict`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          responseType: 'blob',
          timeout: 900000 // 30 second timeout
        }
      );
      
      // Check if response is actually an image
      if (!res.data.type.startsWith('image/')) {
        const errorText = await new Response(res.data).text();
        throw new Error(errorText || 'Invalid response from server');
      }
      
      // Create URL from the blob response
      const imageUrl = URL.createObjectURL(res.data);
      
      // Revoke previous segmentation URL if exists
      if (segmentationResult) {
        URL.revokeObjectURL(segmentationResult);
      }
      
      setSegmentationResult(imageUrl);
    } catch (error) {
      console.error('Segmentation error:', error);
      
      let errorMessage = 'Error processing segmentation';
      if (error.response) {
        try {
          // Try to read error message from blob response
          const errorData = await error.response.data.text();
          errorMessage = JSON.parse(errorData).error || errorData;
        } catch (e) {
          errorMessage = error.response.statusText || errorMessage;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setSegmentationError(errorMessage);
    } finally {
      setSegmentationLoading(false);
    }
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
      setSegmentationError(null);
      
      // Run both requests in parallel
      await Promise.all([
        // Original classification request
        axios.post(
          `${apiBaseUrl}/predict`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }).then(res => setResponse(res.data)),
        
        // New segmentation request
        handleSegmentation(file)
      ]);
      
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error processing image!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header Section */}
      <header className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-3">
            <Brain className="h-8 w-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">NeuroScan AI</h1>
          </div>
          <p className="mt-2 text-gray-600 max-w-3xl">
            Advanced MRI analysis platform for precise brain tumor detection and segmentation
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Brain Tumor Detection & Analysis</h2>
          <p className="mt-2 text-gray-600">Upload an MRI scan for instant AI-powered diagnosis</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Step 1: Upload Section */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600">
                  <span className="font-semibold">1</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Upload MRI Scan</h3>
              </div>
              
              <div 
                className="mt-4 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center
                           hover:bg-gray-50 hover:border-indigo-300 transition-all duration-200"
              >
                <label htmlFor="file-upload" className="cursor-pointer block">
                  <FileImage className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                  <p className="text-sm font-medium text-indigo-600">Click to upload</p>
                  <p className="text-xs text-gray-500 mt-1">JPEG, PNG (Max 5MB)</p>
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
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 relative"
                >
                  <div className="relative rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={preview}
                      alt="MRI Preview"
                      className="w-full h-48 object-cover"
                    />
                    <button
                      onClick={removeFile}
                      className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm
                                hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <XMarkIcon className="h-5 w-5 text-gray-600" />
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-gray-500 text-center">
                    {file?.name}
                  </p>
                </motion.div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleUpload}
                disabled={!file || loading}
                className={`w-full mt-6 py-3 px-4 rounded-lg text-white font-medium 
                           transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 
                           ${!file || loading 
                             ? 'bg-gray-300 cursor-not-allowed' 
                             : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'}`}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  'Analyze Scan'
                )}
              </motion.button>
            </div>
          </div>

          {/* Step 2: Classification Results */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            <div className="p-6 h-full flex flex-col">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600">
                  <span className="font-semibold">2</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Classification Results</h3>
              </div>

              {response ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 flex flex-col"
                >
                  <div className={`mt-4 p-5 rounded-lg ${
                    response.predicted_result === 'no tumor' 
                      ? 'bg-green-50 border border-green-100' 
                      : 'bg-red-50 border border-red-100'
                  }`}>
                    <div className="flex items-center justify-center h-16">
                      <span className={`text-2xl font-bold ${
                        response.predicted_result === 'no tumor' 
                          ? 'text-green-700' 
                          : 'text-red-700'
                      }`}>
                        {response.predicted_result === 'no tumor' ? 'No Tumor Detected' : response.predicted_result}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4 flex-1">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">Confidence</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {Math.round(parseFloat(response.confidence))}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            response.predicted_result === 'no tumor' ? 'bg-green-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${parseFloat(response.confidence)}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Analysis Details</h4>
                      <div className="text-sm text-gray-600">
                        <p>The AI model has analyzed the MRI scan and provided a diagnosis with {Math.round(parseFloat(response.confidence))}% confidence level.</p>
                        <p className="mt-2 text-xs text-gray-500">Note: This tool is for preliminary screening only. Always consult with a healthcare professional for proper diagnosis.</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                  <BarChart3 className="h-12 w-12 text-gray-300 mb-3" />
                  <p className="text-gray-500">Classification results will appear here after analysis</p>
                </div>
              )}
            </div>
          </div>

          {/* Step 3: Segmentation Results */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            <div className="p-6 h-full flex flex-col">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600">
                  <span className="font-semibold">3</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Tumor Segmentation</h3>
              </div>

              <div className="flex-1 flex flex-col">
                {segmentationLoading ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-8">
                    <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-gray-600">Processing segmentation...</p>
                    <p className="text-xs text-gray-500 mt-2">This may take a moment to complete</p>
                  </div>
                ) : segmentationError ? (
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="w-full p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                      <p className="text-red-600 mb-2">{segmentationError}</p>
                      <button 
                        onClick={() => handleSegmentation(file)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
                      >
                        Retry Segmentation
                      </button>
                    </div>
                  </div>
                ) : segmentationResult ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 flex flex-col"
                  >
                    <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                      <img 
                        src={segmentationResult} 
                        alt="Tumor Segmentation" 
                        className="w-full h-48 object-cover"
                      />
                    </div>
                    <div className="mt-4 bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                      <h4 className="text-sm font-medium text-indigo-700 mb-2">Segmentation Analysis</h4>
                      <p className="text-sm text-gray-700">
                        The highlighted areas on the image indicate potential tumor regions identified by our AI segmentation model.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                    <Brain className="h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-gray-500">Segmentation results will appear here after analysis</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </main>

      <footer className="bg-gray-800 text-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <Brain className="h-6 w-6 text-indigo-400" />
              <span className="font-semibold text-lg">NeuroScan AI</span>
            </div>
            <div className="text-sm text-gray-400">
              © {new Date().getFullYear()} NeuroScan AI. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BrainTumorPrediction;