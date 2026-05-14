import React from 'react';

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
};

const DEFAULT_ICON = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

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
    <div className="flex flex-col gap-2">
      {tools.map((t, i) => (
        <div key={i} className="bg-white border border-yellow-100 rounded-xl px-3 py-2.5 shadow-sm">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-yellow-500">{TOOL_ICON[t.type] || DEFAULT_ICON}</span>
            <span className="text-xs font-semibold text-gray-800">{t.type}</span>
            <span className="ml-auto text-xs text-gray-400">{t.agents.length} agent{t.agents.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {t.agents.map((a, j) => (
              <span key={j} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-yellow-50 text-yellow-700 border border-yellow-200">
                {a}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ToolsPanel;
