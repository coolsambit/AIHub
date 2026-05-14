import React, { useState, useEffect, useCallback } from 'react';
import { fetchConsumption, resetConsumption } from '../api/ConsumptionApi';

function fmt(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function barColor(pct) {
  if (pct >= 90) return 'bg-red-500';
  if (pct >= 70) return 'bg-amber-400';
  return 'bg-green-500';
}

function textColor(pct) {
  if (pct >= 90) return 'text-red-600';
  if (pct >= 70) return 'text-amber-600';
  return 'text-green-600';
}

function ModelRow({ model, tokensUsed, tokenLimit, onReset, resetting }) {
  const hasLimit = tokenLimit > 0;
  const pct      = hasLimit ? Math.min(100, Math.round((tokensUsed / tokenLimit) * 100)) : null;

  return (
    <div className="px-4 py-2.5 border-t border-gray-50 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-xs font-semibold text-gray-700 truncate">{model}</span>
        <div className="flex items-center gap-2 shrink-0">
          {pct !== null && (
            <span className={`text-xs font-bold ${textColor(pct)}`}>{pct}%</span>
          )}
          <button
            onClick={onReset}
            disabled={resetting}
            title="Reset counter for this model"
            className="p-1 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-40"
          >
            {resetting
              ? <svg className="w-3.5 h-3.5 animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
              : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            }
          </button>
        </div>
      </div>

      {/* Progress bar */}
      {hasLimit && (
        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1">
          <div
            className={`h-1.5 rounded-full transition-all ${barColor(pct)}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>{fmt(tokensUsed)} used</span>
        {hasLimit
          ? <span>{fmt(tokenLimit)} limit</span>
          : <span className="italic">no limit set</span>
        }
      </div>
    </div>
  );
}

function ProjectRow({ project, onResetModel, resetState }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-purple-50 transition-colors text-left"
      >
        <svg
          className={`w-3 h-3 text-purple-400 transition-transform shrink-0 ${open ? 'rotate-90' : ''}`}
          fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
        </svg>
        <span className="text-xs font-semibold text-purple-800 flex-1 truncate">
          {project.displayName}
        </span>
        <span className="text-xs text-gray-400 shrink-0">
          {project.models.length} model{project.models.length !== 1 ? 's' : ''}
        </span>
      </button>

      {open && project.models.length > 0 && (
        <div>
          {project.models.map(m => (
            <ModelRow
              key={m.model}
              model={m.model}
              tokensUsed={m.tokensUsed}
              tokenLimit={m.tokenLimit}
              resetting={resetState[`${project.subscriptionId}|${m.model}`] === true}
              onReset={() => onResetModel(project.subscriptionId, m.model)}
            />
          ))}
        </div>
      )}

      {open && project.models.length === 0 && (
        <p className="px-4 pb-2.5 text-xs text-gray-400 italic">No usage recorded yet.</p>
      )}
    </div>
  );
}

export default function ConsumptionPanel({ selectedSubscription, getAccessToken }) {
  const [data,       setData]       = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);
  const [resetState, setResetState] = useState({});

  const load = useCallback(async () => {
    if (!selectedSubscription) return;
    setLoading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      if (!token) { setLoading(false); return; }
      const result = await fetchConsumption(token, selectedSubscription);
      setData(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [selectedSubscription, getAccessToken]);

  useEffect(() => { load(); }, [load]);

  const handleResetModel = async (apimSubId, model) => {
    const key = `${apimSubId}|${model}`;
    setResetState(s => ({ ...s, [key]: true }));
    try {
      const token = await getAccessToken();
      if (!token) return;
      await resetConsumption(token, selectedSubscription, apimSubId, model);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setResetState(s => ({ ...s, [key]: false }));
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-purple-100 bg-purple-50 shrink-0">
        <svg className="w-4 h-4 text-purple-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
        </svg>
        <h2 className="text-sm font-bold text-purple-900 uppercase tracking-wide flex-1">Model Consumption</h2>
        <button
          onClick={load}
          disabled={loading}
          title="Refresh"
          className="p-1 rounded-md hover:bg-purple-100 text-purple-400 hover:text-purple-600 transition-colors disabled:opacity-40"
        >
          <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {!selectedSubscription && (
          <p className="px-4 py-4 text-xs text-gray-400 italic">Select a subscription from Inventory to view consumption.</p>
        )}

        {selectedSubscription && loading && data.length === 0 && (
          <div className="flex items-center gap-2 px-4 py-4 text-xs text-gray-400">
            <svg className="w-3.5 h-3.5 animate-spin shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            Loading consumption data…
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center px-4 py-8 text-center gap-3">
            <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21a48.309 48.309 0 01-8.135-.687c-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"/>
            </svg>
            <div>
              <p className="text-sm font-semibold text-gray-500">AI Gateway configuration awaited</p>
              <p className="text-xs text-gray-400 mt-1">Set up AIGatewayAIDS policies and APIM_ADMIN_KEY to enable consumption tracking.</p>
            </div>
          </div>
        )}

        {!loading && !error && selectedSubscription && data.length === 0 && (
          <p className="px-4 py-4 text-xs text-gray-400 italic">No APIM subscriptions found.</p>
        )}

        {data.map(project => (
          <ProjectRow
            key={project.subscriptionId}
            project={project}
            resetState={resetState}
            onResetModel={handleResetModel}
          />
        ))}
      </div>

      {/* Footer */}
      {data.length > 0 && (
        <div className="shrink-0 px-4 py-2 border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-gray-400">Counters reset monthly via APIM · <span className="text-red-400">↺</span> resets a model now</p>
        </div>
      )}
    </div>
  );
}
