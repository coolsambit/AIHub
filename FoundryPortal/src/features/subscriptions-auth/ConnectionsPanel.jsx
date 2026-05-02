import React from 'react';

const TYPE_COLOR = {
  AzureOpenAI:       'bg-blue-100 text-blue-700 border-blue-200',
  CognitiveSearch:   'bg-purple-100 text-purple-700 border-purple-200',
  AzureBlobStorage:  'bg-yellow-100 text-yellow-700 border-yellow-200',
  ApiKey:            'bg-gray-100 text-gray-600 border-gray-200',
  CustomKeys:        'bg-gray-100 text-gray-600 border-gray-200',
};

const TypeBadge = ({ type }) => {
  const cls = TYPE_COLOR[type] || 'bg-teal-100 text-teal-700 border-teal-200';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
      {type}
    </span>
  );
};

const ConnectionsPanel = ({ connections, isLoading, error }) => {
  if (!connections && !isLoading && !error) {
    return <p className="text-gray-400 italic text-xs">Select a project to view connections.</p>;
  }
  if (isLoading) {
    return <p className="text-gray-400 italic text-xs">Loading connections…</p>;
  }
  if (error) {
    return <p className="text-red-500 text-xs">{error}</p>;
  }
  if (connections.length === 0) {
    return <p className="text-gray-400 italic text-xs">No connections found.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {connections.map((c, i) => (
        <div key={i} className="bg-white border border-teal-100 rounded-xl px-3 py-2.5 shadow-sm flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-800 truncate">{c.name}</p>
            {c.target && (
              <p className="text-xs text-gray-400 truncate mt-0.5">{c.target}</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {c.isShared && (
              <span className="text-xs text-gray-400 italic">shared</span>
            )}
            <TypeBadge type={c.type} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ConnectionsPanel;
