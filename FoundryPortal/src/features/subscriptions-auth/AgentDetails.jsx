import React, { useState } from 'react';

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

const Section = ({ title, children, collapsible = false, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-3">
      {collapsible ? (
        <button
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-1 text-xs font-bold text-purple-700 uppercase tracking-wide mb-1.5 text-left"
        >
          <span>{title}</span>
          <span className="text-purple-400">{open ? '▲' : '▼'}</span>
        </button>
      ) : (
        <p className="text-xs font-bold text-purple-700 uppercase tracking-wide mb-1.5">{title}</p>
      )}
      {(!collapsible || open) && (
        <div className="bg-white border border-purple-100 rounded-xl p-3 shadow-sm text-xs text-gray-700">
          {children}
        </div>
      )}
    </div>
  );
};

const KV = ({ label, value }) => value == null ? null : (
  <div className="flex justify-between py-0.5 border-b border-gray-50 last:border-0">
    <span className="text-gray-500">{label}</span>
    <span className="font-medium text-gray-800 text-right max-w-xs truncate">{String(value)}</span>
  </div>
);

const INTERVENTION_LABEL = { Prompt: 'User input', Completion: 'Output' };

const FilterGroup = ({ category, filters }) => {
  const [open, setOpen] = useState(false);
  const uniqueCount = new Set(filters.map(f => f.name)).size;
  return (
    <div className="border border-gray-100 rounded-lg mb-1.5 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-1 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-xs font-semibold text-purple-700 text-left"
      >
        <span>{category} <span className="text-gray-400 font-normal">({uniqueCount})</span></span>
        <span className="text-purple-400">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 text-gray-500">
              <th className="text-left px-3 py-1">Risk type</th>
              <th className="text-left px-3 py-1">Intervention point</th>
              <th className="text-left px-3 py-1">Action</th>
            </tr>
          </thead>
          <tbody>
            {filters.map((f, i) => (
              <tr key={i} className="border-t border-gray-50">
                <td className="px-3 py-1">{f.severityThreshold ? `${f.name}: ${f.severityThreshold} blocking` : f.name}</td>
                <td className="px-3 py-1">{INTERVENTION_LABEL[f.source] || f.source}</td>
                <td className="px-3 py-1">
                  <Badge color={f.blocking ? 'red' : 'gray'}>{f.blocking ? 'Block' : 'Log only'}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const GuardrailsGrid = ({ guardrails, isGuardrailsLoading }) => {
  if (isGuardrailsLoading) {
    return <p className="text-xs text-gray-400 italic">Inspecting guardrail layers…</p>;
  }
  if (!guardrails) return null;
  if (guardrails.error) {
    return <p className="text-xs text-red-500">{guardrails.error}</p>;
  }

  const { agent, model, guardrails: rai, gateway } = guardrails;

  // Only show user-configured categories (Microsoft applies indirect attack defaults automatically)
  const CATEGORY_MAP = {
    'Hate': 'Content safety',
    'Selfharm': 'Content safety',
    'Sexual': 'Content safety',
    'Violence': 'Content safety',
    'Protected Material Text': 'Protected materials',
    'Protected Material Code': 'Protected materials',
    'ProtectedMaterialText': 'Protected materials',
    'ProtectedMaterialCode': 'Protected materials',
    'Jailbreak': 'Jailbreak',
  };

  const filterGroups = {};
  for (const f of (rai?.contentFilters || [])) {
    const key = CATEGORY_MAP[f.name];
    if (!key) continue; // skip Microsoft-managed defaults
    if (!filterGroups[key]) filterGroups[key] = [];
    filterGroups[key].push(f);
  }

  return (
    <div className="flex flex-col gap-2">

      {/* Layer 1 — Agent Guardrail Policy (includes content filters) */}
      <Section title="Layer 1 — User Defined Guardrail" collapsible defaultOpen={false}>
        {!agent?.guardrailPolicyName
          ? <p className="text-gray-400 italic">No guardrail policy assigned to this agent.</p>
          : (
            <div>
              <KV label="Name" value={agent.guardrailPolicyName} />
              {rai?.available && Object.keys(filterGroups).length > 0 && (
                <div className="mt-2">
                  {Object.entries(filterGroups).map(([category, filters]) => (
                    <FilterGroup key={category} category={category} filters={filters} />
                  ))}
                </div>
              )}
            </div>
          )
        }
      </Section>

      {/* Layer 2 — API Gateway Policies */}
      <Section title="Layer 2 — API Gateway Policies" collapsible defaultOpen={false}>
        {!gateway
          ? <p className="text-gray-400 italic">No APIM configured for this agent.</p>
          : (
            <div className="flex flex-col gap-1">
              <KV label="Rate limit" value={gateway.guardrails?.rate_limit ? `${gateway.guardrails.rate_limit.calls} calls / ${gateway.guardrails.rate_limit.period}s` : 'None'} />
              <KV label="Token limit" value={gateway.guardrails?.token_limit ? `${gateway.guardrails.token_limit.tokens_per_minute} TPM` : 'None'} />
              <KV label="PII masking" value={gateway.guardrails?.pii_masking ? 'Enabled' : 'Not configured'} />
              <KV label="Auth enforced" value={gateway.guardrails?.auth_enforced ? 'Yes' : 'No'} />
              <KV label="Semantic cache" value={gateway.guardrails?.semantic_cache ? 'Enabled' : 'Not configured'} />
            </div>
          )
        }
      </Section>

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
  const model        = props.model || {};
  const instructions = props.instructions || '';
  const tools        = props.tools || [];

  return (
    <div className="flex flex-col gap-5 h-full">

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
          {guardrails?.agent?.model && (
            <p className="text-xs text-gray-500 mb-4">Model Assigned: <span className="font-bold text-gray-800">{guardrails.agent.model}</span></p>
          )}
          <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-2">User Defined Guardrails</p>
          <GuardrailsGrid guardrails={guardrails} isGuardrailsLoading={isGuardrailsLoading} />
        </div>
      )}

    </div>
  );
};

export default AgentDetails;
