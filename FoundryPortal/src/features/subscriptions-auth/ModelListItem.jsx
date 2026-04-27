
import React from 'react';



const ModelListItem = ({ model, onClick }) => {
  return (
    <button
      className="w-full text-left bg-white border border-blue-100 rounded-lg px-3 py-1.5 shadow-sm hover:bg-blue-50 transition"
      onClick={onClick}
    >
      <span className="font-semibold text-blue-800">{model.name}</span>
    </button>
  );
};

export default ModelListItem;
