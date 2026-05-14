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
          className="flex items-center gap-1 text-xs font-bold text-blue-700 uppercase tracking-wide mb-1.5 text-left"
        >
          <span>{title}</span>
          <span className="text-blue-400">{open ? '▲' : '▼'}</span>
        </button>
      ) : (
        <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-1.5">{title}</p>
      )}
      {(!collapsible || open) && (
        <div className="bg-white border border-blue-100 rounded-xl p-3 shadow-sm text-xs text-gray-700">
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
        className="w-full flex items-center gap-1 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-xs font-semibold text-blue-700 text-left"
      >
        <span>{category} <span className="text-gray-400 font-normal">({uniqueCount})</span></span>
        <span className="text-blue-400">{open ? '▲' : '▼'}</span>
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

const InfoRow = ({ label, value }) => (
  <div className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
    <span className="text-xs text-gray-500">{label}</span>
    <span className="text-xs font-medium text-gray-800">{value ?? '—'}</span>
  </div>
);

const RateCard = ({ icon, title, value, sub }) => (
  <div className="flex-1 bg-white border border-blue-100 rounded-xl p-3 flex flex-col gap-1 shadow-sm">
    <div className="flex items-center gap-2 mb-1">
      <span className="text-blue-400">{icon}</span>
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</span>
    </div>
    <span className="text-xl font-bold text-blue-700">{value}</span>
    <span className="text-xs text-gray-400">{sub}</span>
  </div>
);

const ModelGuardrails = ({ model, guardrails, isGuardrailsLoading }) => {
  if (!model) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400 italic text-sm">
        Select a model to view details.
      </div>
    );
  }

  const props      = model.properties || {};
  const modelInfo  = props.model || {};
  const sku        = model.sku || {};
  const rateLimits = props.rateLimits || [];
  const state      = props.provisioningState || 'Unknown';
  const upgradeOpt = props.versionUpgradeOption;

  const rpmLimit = rateLimits.find(r => r.key === 'request');
  const tpmLimit = rateLimits.find(r => r.key === 'token');
  const stateColor = state === 'Succeeded' ? 'green' : state === 'Failed' ? 'red' : 'yellow';

  const filterGroups = {};
  for (const f of (guardrails?.guardrails?.contentFilters || [])) {
    const key = CATEGORY_MAP[f.name];
    if (!key) continue;
    if (!filterGroups[key]) filterGroups[key] = [];
    filterGroups[key].push(f);
  }

  return (
    <div className="flex flex-col gap-4 h-full">

      {/* Rate Limits */}
      {(rpmLimit || tpmLimit) && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Rate Limits</p>
          <div className="flex gap-2">
            {rpmLimit && (
              <RateCard
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>}
                title="Req / min"
                value={rpmLimit.count.toLocaleString()}
                sub={`Resets every ${rpmLimit.renewalPeriod}s`}
              />
            )}
            {tpmLimit && (
              <RateCard
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>}
                title="Tokens / min"
                value={(tpmLimit.count / 1000).toLocaleString() + 'K'}
                sub={`Resets every ${tpmLimit.renewalPeriod}s`}
              />
            )}
          </div>
        </div>
      )}

      {/* Deployment Info */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Deployment</p>
        <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
          {sku.name     && <InfoRow label="SKU"      value={sku.name} />}
          {sku.capacity && <InfoRow label="Capacity" value={`${sku.capacity.toLocaleString()} units`} />}
          {modelInfo.format && <InfoRow label="Format" value={modelInfo.format} />}
          {upgradeOpt   && <InfoRow label="Upgrade policy" value={upgradeOpt.replace(/([A-Z])/g, ' $1').trim()} />}
        </div>
      </div>

      {/* Guardrails */}
      {isGuardrailsLoading && (
        <p className="text-xs text-gray-400 italic">Inspecting guardrail layers…</p>
      )}
      {guardrails?.error && (
        <p className="text-xs text-red-500">{guardrails.error}</p>
      )}
      {guardrails && !guardrails.error && !isGuardrailsLoading && (
        <div>
          <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-2">Deployment Guardrails</p>
          <Section title="RAI Policy" collapsible defaultOpen={false}>
            {!guardrails.deployment?.raiPolicy
              ? <p className="text-gray-400 italic">No RAI policy assigned to this deployment.</p>
              : (
                <div>
                  <KV label="Name" value={guardrails.deployment.raiPolicy} />
                  {guardrails.guardrails?.available && Object.keys(filterGroups).length > 0 && (
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
        </div>
      )}

    </div>
  );
};

export default ModelGuardrails;
