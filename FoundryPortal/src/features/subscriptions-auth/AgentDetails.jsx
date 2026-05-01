import React from 'react';

const Badge = ({ children, color = 'gray' }) => {
  const colors = {
    green:  'bg-green-100 text-green-700 border-green-200',
    blue:   'bg-blue-100 text-blue-700 border-blue-200',
    yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    red:    'bg-red-100 text-red-700 border-red-200',
    gray:   'bg-gray-100 text-gray-600 border-gray-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${colors[color]}`}>
      {children}
    </span>
  );
};

const GuardrailsGrid = ({ guardrails, isGuardrailsLoading }) => {
  if (isGuardrailsLoading) {
    return <p className="text-xs text-gray-400 italic">Loading guardrails…</p>;
  }
  if (!guardrails) return null;
  if (guardrails.error) {
    return <p className="text-xs text-red-500">Could not load guardrails: {guardrails.error}</p>;
  }

  const list = guardrails.guardrails || [];
  const assignedId = guardrails.assignedGuardrailId;

  if (list.length === 0) {
    return assignedId
      ? <p className="text-xs text-gray-600">Assigned: <span className="font-medium">{assignedId}</span> <span className="text-gray-400">(project guardrail list unavailable)</span></p>
      : <p className="text-xs text-gray-400 italic">No guardrails assigned to this agent.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-purple-100 shadow-sm">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-purple-50 text-purple-700">
            <th className="text-left px-3 py-2 font-semibold">Name</th>
            <th className="text-left px-3 py-2 font-semibold">Assigned</th>
            <th className="text-left px-3 py-2 font-semibold">Properties</th>
          </tr>
        </thead>
        <tbody>
          {list.map((gr, i) => {
            const props = gr.properties || {};
            const propEntries = Object.entries(props).filter(([, v]) => v !== null && v !== undefined && v !== '');
            return (
              <tr key={gr.id || gr.name || i} className={`border-t border-purple-50 ${gr.assignedToThisAgent ? 'bg-green-50' : 'bg-white'}`}>
                <td className="px-3 py-2 font-medium text-gray-800 whitespace-nowrap">{gr.name || '—'}</td>
                <td className="px-3 py-2">
                  {gr.assignedToThisAgent
                    ? <Badge color="green">Assigned</Badge>
                    : <Badge color="gray">—</Badge>}
                </td>
                <td className="px-3 py-2 text-gray-600">
                  {propEntries.length === 0
                    ? <span className="italic text-gray-400">—</span>
                    : (
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                        {propEntries.map(([k, v]) => (
                          <span key={k}><span className="font-medium text-gray-700">{k}:</span> {String(v)}</span>
                        ))}
                      </div>
                    )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const InfoRow = ({ label, value }) => (
  <div className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
    <span className="text-xs text-gray-500">{label}</span>
    <span className="text-xs font-medium text-gray-800">{value ?? '—'}</span>
  </div>
);

const AgentDetails = ({ agent, guardrails, isGuardrailsLoading }) => {
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

      {/* GuardRails */}
      {(guardrails || isGuardrailsLoading) && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">GuardRails</p>
          <GuardrailsGrid guardrails={guardrails} isGuardrailsLoading={isGuardrailsLoading} />
        </div>
      )}

    </div>
  );
};

export default AgentDetails;
