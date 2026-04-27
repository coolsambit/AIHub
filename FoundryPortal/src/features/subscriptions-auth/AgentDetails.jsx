import React from 'react';

const Badge = ({ children, color = 'gray' }) => {
  const colors = {
    green:  'bg-green-100 text-green-700 border-green-200',
    blue:   'bg-blue-100 text-blue-700 border-blue-200',
    yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    gray:   'bg-gray-100 text-gray-600 border-gray-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${colors[color]}`}>
      {children}
    </span>
  );
};

const InfoRow = ({ label, value }) => (
  <div className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
    <span className="text-xs text-gray-500">{label}</span>
    <span className="text-xs font-medium text-gray-800">{value ?? '—'}</span>
  </div>
);

const AgentDetails = ({ agent }) => {
  if (!agent) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400 italic text-sm">
        Select an agent to view details.
      </div>
    );
  }

  const props        = agent.properties || {};
  const state        = props.provisioningState || 'Unknown';
  const description  = props.description || agent.description || '';
  const model        = props.model || {};
  const instructions = props.instructions || '';
  const tools        = props.tools || [];

  const stateColor = state === 'Succeeded' ? 'green' : state === 'Failed' ? 'red' : 'yellow';

  return (
    <div className="flex flex-col gap-5 h-full">

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-bold text-purple-900">
            {agent.name}
            {agent.id && <span className="text-xs font-normal text-gray-400 ml-1.5">· {agent.id}</span>}
          </p>
          {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
        </div>
        <Badge color={stateColor}>{state}</Badge>
      </div>

      {/* Model */}
      {model.id && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Model</p>
          <div className="bg-white border border-purple-100 rounded-xl p-3 shadow-sm">
            <InfoRow label="Model ID" value={model.id} />
            {model.provider && <InfoRow label="Provider" value={model.provider} />}
          </div>
        </div>
      )}

      {/* Tools */}
      {tools.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tools</p>
          <div className="flex flex-wrap gap-1.5">
            {tools.map((t, i) => (
              <Badge key={i} color="blue">{t.type || t}</Badge>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      {instructions && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Instructions</p>
          <p className="text-xs text-gray-600 leading-relaxed bg-white border border-purple-100 rounded-xl p-3 shadow-sm line-clamp-4">{instructions}</p>
        </div>
      )}

    </div>
  );
};

export default AgentDetails;
