import React from 'react';

const PredictionResult = ({ result }) => {
  return (
    <div className="bg-white p-6 shadow-lg rounded-lg mt-8">
      <h2 className="text-2xl font-semibold text-primary">Prediction Result</h2>
      <p className="mt-4 text-lg">
        <strong>Predicted Result:</strong> {result.predicted_result}
      </p>
      <p className="mt-2 text-lg">
        <strong>Confidence:</strong> {result.confidence}
      </p>
      <p className="mt-2 text-lg">
        <strong>Status:</strong> {result.message}
      </p>
    </div>
  );
};

export default PredictionResult;
