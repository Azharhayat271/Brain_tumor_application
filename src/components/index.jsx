import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowUpTrayIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Brain, FileImage } from 'lucide-react';
import { apiBaseUrl, segmentationModelBaseUrl } from '../../config';

const BrainTumorPrediction = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [segmentationLoading, setSegmentationLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [segmentationResult, setSegmentationResult] = useState(null);
  const [segmentationError, setSegmentationError] = useState(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
      if (segmentationResult) URL.revokeObjectURL(segmentationResult);
    };
  }, [preview, segmentationResult]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
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

  const handleSegmentation = async (file, label) => {
    try {
      setSegmentationLoading(true);
      setSegmentationError(null);

      // If no tumor is detected, use the original image as segmentation result
      if (label === 'no tumor') {
        setSegmentationResult(preview);
        setSegmentationLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('tumor_type', label);

      const res = await axios.post(
        `${segmentationModelBaseUrl}/predict`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          responseType: 'blob',
          timeout: 900000,
        }
      );

      if (!res.data.type.startsWith('image/')) {
        const errorText = await new Response(res.data).text();
        throw new Error(errorText || 'Invalid response from server');
      }

      const imageUrl = URL.createObjectURL(res.data);
      if (segmentationResult) {
        URL.revokeObjectURL(segmentationResult);
      }

      setSegmentationResult(imageUrl);
    } catch (error) {
      console.error('Segmentation error:', error);
      let errorMessage = 'Error processing segmentation';

      if (error.response) {
        try {
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

      const res = await axios.post(`${apiBaseUrl}/predict`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const prediction = res.data.predicted_result;
      setResponse(res.data);

      // Only call segmentation if tumor is detected
      await handleSegmentation(file, prediction);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error processing image!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
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
        {/* Upload section */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-md p-6">
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
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 relative">
                <div className="relative rounded-lg overflow-hidden border border-gray-200">
                  <img src={preview} alt="MRI Preview" className="w-full h-48 object-cover" />
                  <button
                    onClick={removeFile}
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm
                            hover:bg-gray-100 focus:outline-none"
                  >
                    <XMarkIcon className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-500 text-center">{file?.name}</p>
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
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
                }`}
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

          {/* Results Section */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600">
                <span className="font-semibold">2</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Classification Result</h3>
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
                        {response.predicted_result === 'no tumor' ? (
                          <p className="mt-2 text-xs text-gray-500">No tumor segmentation performed as no tumor was detected.</p>
                        ) : (
                          <p className="mt-2 text-xs text-gray-500">The segmentation result shows the detected tumor region.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                  <p className="text-gray-500">Classification results will appear here after analysis</p>
                </div>
              )}
          </div>

          {/* Segmentation Output */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600">
                <span className="font-semibold">3</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Segmentation Result</h3>
            </div>
            {segmentationLoading ? (
              <p className="text-sm text-gray-500">Processing segmentation...</p>
            ) : segmentationError ? (
              <p className="text-sm text-red-600">{segmentationError}</p>
            ) : segmentationResult ? (
              <>
                <img
                  src={segmentationResult}
                  alt={response?.predicted_result === 'no tumor' ? "Original MRI Scan" : "Segmentation Output"}
                  className="rounded-lg w-full object-contain"
                />
                {response?.predicted_result === 'no tumor' && (
                  <p className="mt-2 text-sm text-gray-500 text-center">
                    Original image shown (no tumor detected)
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-500">No segmentation yet.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default BrainTumorPrediction;