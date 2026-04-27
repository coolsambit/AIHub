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

const RateCard = ({ icon, title, value, sub }) => (
  <div className="flex-1 bg-white border border-blue-100 rounded-xl p-4 flex flex-col gap-1 shadow-sm">
    <div className="flex items-center gap-2 mb-1">
      <span className="text-blue-400">{icon}</span>
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</span>
    </div>
    <span className="text-2xl font-bold text-blue-700">{value}</span>
    <span className="text-xs text-gray-400">{sub}</span>
  </div>
);

const ModelDetails = ({ model }) => {
  if (!model) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400 italic text-sm">
        Select a model to view details.
      </div>
    );
  }

  const props        = model.properties || {};
  const modelInfo    = props.model || {};
  const sku          = model.sku || {};
  const rateLimits   = props.rateLimits || [];
  const state        = props.provisioningState || 'Unknown';
  const upgradeOpt   = props.versionUpgradeOption;

  const rpmLimit = rateLimits.find(r => r.key === 'request');
  const tpmLimit = rateLimits.find(r => r.key === 'token');

  const stateColor = state === 'Succeeded' ? 'green' : state === 'Failed' ? 'red' : 'yellow';

  return (
    <div className="flex flex-col gap-5 h-full">

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          {modelInfo.name && (
            <p className="text-base font-bold text-blue-900">
              {modelInfo.name}
              {modelInfo.version && <span className="text-xs font-normal text-gray-500 ml-1.5">· v{modelInfo.version}</span>}
            </p>
          )}
        </div>
        <Badge color={stateColor}>{state}</Badge>
      </div>

      {/* Rate Limits */}
      {(rpmLimit || tpmLimit) && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Rate Limits</p>
          <div className="flex gap-3">
            {rpmLimit && (
              <RateCard
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>}
                title="Requests / min"
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
          {sku.name      && <InfoRow label="SKU"      value={sku.name} />}
          {sku.capacity  && <InfoRow label="Capacity" value={`${sku.capacity.toLocaleString()} units`} />}
          {modelInfo.format && <InfoRow label="Format" value={modelInfo.format} />}
          {upgradeOpt    && <InfoRow label="Upgrade policy" value={upgradeOpt.replace(/([A-Z])/g, ' $1').trim()} />}
        </div>
      </div>

    </div>
  );
};

export default ModelDetails;
