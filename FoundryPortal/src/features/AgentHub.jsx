import React from 'react';
import { useSearchParams } from 'react-router-dom';
import AgentTypes from './agents/AgentTypes';
import AgentHosting from './agents/AgentHosting';
import MemoryAgentPath from './agents/MemoryAgentPath';
import AgentGovernance from './agents/AgentGovernance';
import AgentSecurity from './agents/AgentSecurity';

const TABS = [
  { id: 'types',    label: 'Agent Types',         caption: 'Prompt · Custom · Third-party' },
  { id: 'hosting',  label: 'Hosting',             caption: 'Foundry vs AKS / Web App' },
  { id: 'build',    label: 'Build: Memory Agent', caption: 'Agent Framework step by step' },
  { id: 'govern',   label: 'Register & Govern',   caption: 'API Center · M365 admin center' },
  { id: 'security', label: 'Security & Identity', caption: 'Entra Agent ID · threats' },
];

export default function AgentHub() {
  const [params, setParams] = useSearchParams();
  const tab = TABS.some(t => t.id === params.get('tab')) ? params.get('tab') : 'types';
  const goTo = (id) => {
    setParams({ tab: id });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full max-w-full">
      {/* Page banner */}
      <div className="w-full bg-gradient-to-br from-indigo-700 to-violet-500 rounded-2xl p-5 md:p-8 mb-6 shadow-lg text-white flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-1">Agent Hub</h1>
          <p className="text-indigo-100 text-sm md:text-base max-w-3xl">
            Choose the right kind of agent, decide where it runs, build it step by step, then register, publish and secure it across Azure and Microsoft 365.
          </p>
        </div>
        <a
          href="https://ai.azure.com"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 px-4 py-2 bg-white text-indigo-700 rounded-xl text-sm font-semibold shadow hover:bg-indigo-50 transition-colors"
        >
          Open Foundry ↗
        </a>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-2 mb-6">
        {TABS.map(t => {
          const active = t.id === tab;
          return (
            <button
              key={t.id}
              onClick={() => goTo(t.id)}
              className={`text-left rounded-xl border px-3 py-2.5 transition-colors ${active ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-gray-200 text-gray-800 hover:border-indigo-300 hover:bg-indigo-50'}`}
            >
              <p className="text-sm font-bold">{t.label}</p>
              <p className={`text-xs ${active ? 'text-indigo-100' : 'text-gray-500'}`}>{t.caption}</p>
            </button>
          );
        })}
      </div>

      {tab === 'types' && <AgentTypes />}
      {tab === 'hosting' && <AgentHosting />}
      {tab === 'build' && <MemoryAgentPath goTo={goTo} />}
      {tab === 'govern' && <AgentGovernance />}
      {tab === 'security' && <AgentSecurity />}
    </div>
  );
}
