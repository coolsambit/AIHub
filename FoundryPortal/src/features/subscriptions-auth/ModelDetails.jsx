
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Accepts model and onBack props for modal use, but still works with route navigation
const ModelDetails = ({ model: propModel, onBack }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const model = propModel || location.state?.model;

  if (!model) {
    return (
      <div className="p-8">
        <h2 className="text-xl font-bold mb-4">No Model Data</h2>
        <button onClick={onBack ? onBack : () => navigate(-1)} className="text-blue-600 underline">Back</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-xl shadow border border-gray-200 mt-8">
      <h2 className="text-2xl font-bold mb-4">Model Details: {model.name}</h2>
      <pre className="bg-gray-50 p-4 rounded text-sm overflow-x-auto border border-gray-100">
        {JSON.stringify(model, null, 2)}
      </pre>
      <button onClick={onBack ? onBack : () => navigate(-1)} className="mt-4 text-blue-600 underline">Back</button>
    </div>
  );
};

export default ModelDetails;
