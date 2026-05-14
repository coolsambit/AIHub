import React from 'react';

const TOOL_INFO = {
  file_search: {
    label: 'File Search',
    description: 'Searches over uploaded files using vector embeddings for retrieval-augmented generation.',
    border: 'border-l-blue-400',
    icon: 'text-blue-500',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    metaKey: 'Vector stores',
    metaField: 'vector_store_ids',
  },
  code_interpreter: {
    label: 'Code Interpreter',
    description: 'Executes Python code in a sandboxed environment to perform calculations and generate outputs.',
    border: 'border-l-green-400',
    icon: 'text-green-500',
    badge: 'bg-green-50 text-green-700 border-green-200',
  },
  bing_grounding: {
    label: 'Bing Grounding',
    description: 'Grounds responses with real-time Bing web search results.',
    border: 'border-l-orange-400',
    icon: 'text-orange-500',
    badge: 'bg-orange-50 text-orange-700 border-orange-200',
  },
  azure_ai_search: {
    label: 'Azure AI Search',
    description: 'Retrieves and ranks documents from an Azure AI Search index.',
    border: 'border-l-purple-400',
    icon: 'text-purple-500',
    badge: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  sharepoint_grounding: {
    label: 'SharePoint Grounding',
    description: 'Retrieves content from SharePoint sites to ground responses.',
    border: 'border-l-teal-400',
    icon: 'text-teal-500',
    badge: 'bg-teal-50 text-teal-700 border-teal-200',
  },
  azure_function: {
    label: 'Azure Function',
    description: 'Calls a custom Azure Function tool for business logic.',
    border: 'border-l-indigo-400',
    icon: 'text-indigo-500',
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
};

const TOOL_ICON = {
  code_interpreter: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
    </svg>
  ),
  file_search: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
    </svg>
  ),
  bing_grounding: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/>
    </svg>
  ),
  azure_ai_search: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/>
    </svg>
  ),
  sharepoint_grounding: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/>
    </svg>
  ),
  azure_function: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
    </svg>
  ),
};

const DEFAULT_ICON = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

function humanize(str) {
  return String(str).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function parseTool(t) {
  let typeName = t.type || '';
  let meta = {};

  // Handle Python dict strings like "{'type': 'file_search', 'vector_store_ids': ['vs_...']}"
  if (typeName.startsWith('{')) {
    try {
      const jsonStr = typeName
        .replace(/'/g, '"')
        .replace(/\bTrue\b/g, 'true')
        .replace(/\bFalse\b/g, 'false')
        .replace(/\bNone\b/g, 'null');
      const parsed = JSON.parse(jsonStr);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        typeName = parsed.type || typeName;
        const { type: _ignored, ...rest } = parsed;
        meta = rest;
      }
    } catch {
      // keep typeName as-is
    }
  }

  return { typeName, meta };
}

function MetaRow({ label, value }) {
  if (value == null || value === '') return null;
  return (
    <div className="flex gap-1.5 items-start text-xs">
      <span className="text-gray-400 shrink-0 pt-0.5">{label}:</span>
      {Array.isArray(value) ? (
        <div className="flex flex-wrap gap-1">
          {value.map((item, i) => (
            <span key={i} className="font-mono text-gray-600 bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5 text-xs">
              {String(item)}
            </span>
          ))}
        </div>
      ) : (
        <span className="text-gray-600 font-mono break-all">{String(value)}</span>
      )}
    </div>
  );
}

const ToolsPanel = ({ tools, isLoading, error }) => {
  if (!tools && !isLoading && !error) {
    return <p className="text-gray-400 italic text-xs">Select a project to view tools.</p>;
  }
  if (isLoading) {
    return <p className="text-gray-400 italic text-xs">Loading tools…</p>;
  }
  if (error) {
    return <p className="text-red-500 text-xs">{error}</p>;
  }
  if (tools.length === 0) {
    return <p className="text-gray-400 italic text-xs">No tools in use across agents.</p>;
  }

  return (
    <div className="flex flex-col gap-2.5">
      {tools.map((t, i) => {
        const { typeName, meta } = parseTool(t);
        const info = TOOL_INFO[typeName] || {};
        const label = info.label || humanize(typeName);
        const metaEntries = Object.entries(meta).filter(([, v]) => v != null && v !== '');

        return (
          <div
            key={i}
            className={`bg-white border border-l-4 rounded-xl px-3 py-3 shadow-sm ${info.border || 'border-l-yellow-400'} border-yellow-100`}
          >
            {/* Header row */}
            <div className="flex items-center gap-2 mb-1">
              <span className={info.icon || 'text-yellow-500'}>
                {TOOL_ICON[typeName] || DEFAULT_ICON}
              </span>
              <span className="text-xs font-bold text-gray-800 flex-1">{label}</span>
              <span className="text-xs text-gray-400 shrink-0">
                {t.agents.length} agent{t.agents.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Description */}
            {info.description && (
              <p className="text-xs text-gray-500 mb-2 leading-relaxed">{info.description}</p>
            )}

            {/* Meta fields from parsed Python dict (e.g. vector_store_ids) */}
            {metaEntries.length > 0 && (
              <div className="flex flex-col gap-1 mb-2 p-2 bg-gray-50 border border-gray-100 rounded-lg">
                {metaEntries.map(([k, v]) => (
                  <MetaRow key={k} label={humanize(k)} value={v} />
                ))}
              </div>
            )}

            {/* Agent badges */}
            {t.agents.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {t.agents.map((a, j) => (
                  <span
                    key={j}
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${info.badge || 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}
                  >
                    {a}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ToolsPanel;
