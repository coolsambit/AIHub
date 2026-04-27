
import React from "react";
import WelcomeBanner from "./WelcomeBanner";
import { useIsAuthenticated } from '@azure/msal-react';

export default function Home({ subscriptionRoles, cognitiveRoles, azureAiRoles }) {
  const isAuthenticated = useIsAuthenticated();
  const subRoles = Array.isArray(subscriptionRoles) ? subscriptionRoles : [];
  const cogRoles = Array.isArray(cognitiveRoles) ? cognitiveRoles : [];
  const aiRoles = Array.isArray(azureAiRoles) ? azureAiRoles : [];

  return (
    <div className="w-full">
      {/* Top flex row: roles and welcome */}
      <div className="flex flex-row flex-wrap items-center w-full max-w-7xl mx-auto mb-8 gap-4">
        <div className="flex-1 flex flex-col items-center">
          <WelcomeBanner>
            {isAuthenticated && (
              <div className="flex flex-row gap-2 mt-4 mx-auto justify-center items-stretch whitespace-nowrap">
                {/* Subscription Role */}
                <div className="flex flex-col items-center bg-green-50 border border-green-200 rounded-xl px-2 py-1 shadow-sm min-w-[90px]">
                  <div className="flex items-center gap-1 mb-0.5">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4" fill="#bbf7d0"/><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8M12 8v8" /></svg>
                    <span className="font-semibold text-green-800 text-xs">Subscription Role</span>
                  </div>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {subRoles.length > 0 ? subRoles.map((r, i) => (
                      <span key={r + i} className="inline-block bg-green-100 text-green-800 rounded px-1.5 py-0.5 text-xs">{r}</span>
                    )) : <span className="text-gray-400 text-xs">None</span>}
                  </div>
                </div>
                {/* Cognitive Role */}
                <div className="flex flex-col items-center bg-blue-50 border border-blue-200 rounded-xl px-2 py-1 shadow-sm min-w-[90px]">
                  <div className="flex items-center gap-1 mb-0.5">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="#dbeafe"/><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8M12 8v8" /></svg>
                    <span className="font-semibold text-blue-800 text-xs">Cognitive Role</span>
                  </div>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {cogRoles.length > 0 ? cogRoles.map((r, i) => (
                      <span key={r + i} className="inline-block bg-blue-100 text-blue-800 rounded px-1.5 py-0.5 text-xs">{r}</span>
                    )) : <span className="text-gray-400 text-xs">None</span>}
                  </div>
                </div>
                {/* Azure AI Role */}
                <div className="flex flex-col items-center bg-purple-50 border border-purple-200 rounded-xl px-2 py-1 shadow-sm min-w-[90px]">
                  <div className="flex items-center gap-1 mb-0.5">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4" fill="#ede9fe"/><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8M12 8v8" /></svg>
                    <span className="font-semibold text-purple-800 text-xs">Azure AI Role</span>
                  </div>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {aiRoles.length > 0 ? aiRoles.map((r, i) => (
                      <span key={r + i} className="inline-block bg-purple-100 text-purple-800 rounded px-1.5 py-0.5 text-xs">{r}</span>
                    )) : <span className="text-gray-400 text-xs">None</span>}
                  </div>
                </div>
              </div>
            )}
          </WelcomeBanner>
        </div>
      </div>
      <div className="w-full bg-blue-50 border border-blue-100 rounded-2xl p-10 mb-8 shadow-sm text-left flex flex-col gap-8">
        <section className="flex items-start gap-6 mb-2">
          <span className="mt-1"><svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" fill="#bbf7d0"/><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8M12 8v8" /></svg></span>
          <div>
            <h3 className="text-xl font-semibold mb-1">MaaS (Model as a Service) <a href="https://azure.microsoft.com/en-us/products/ai-services/openai-service" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-base ml-2">Learn more</a></h3>
            <p className="text-gray-700">
              Model as a Service (MaaS) is a cloud-based approach where AI/ML models are hosted and served via APIs. Users can access, deploy, and scale models without managing the underlying infrastructure. OpenAI, Azure OpenAI, and Foundry all provide MaaS, handling hosting, scaling, and monitoring for you.
            </p>
          </div>
        </section>
        <section className="flex items-start gap-6 mb-2">
          <span className="mt-1"><svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="#e0e7ff"/><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8M12 8v8" /></svg></span>
          <div>
            <h3 className="text-xl font-semibold mb-1">OpenAI Models <a href="https://platform.openai.com/docs/models" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-base ml-2">Learn more</a></h3>
            <p className="text-gray-700">
              OpenAI models are advanced AI models (like GPT-3, GPT-4, DALL·E) developed by OpenAI. They are typically accessed via API and used for tasks such as text generation, summarization, code completion, and image generation. OpenAI delivers these models as a service (MaaS), so you don’t need to manage the infrastructure.
            </p>
          </div>
        </section>
        
        <section className="flex items-start gap-6 mb-2">
          <span className="mt-1"><svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" fill="#ede9fe"/><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8M12 8v8" /></svg></span>
          <div>
            <h3 className="text-xl font-semibold mb-1">Microsoft Foundry Models <a href="https://learn.microsoft.com/en-us/fabric/ai-services/foundry/overview" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-base ml-2">Learn more</a></h3>
            <p className="text-gray-700">
              Foundry models are AI models hosted and managed within Microsoft’s Foundry platform. Foundry provides a secure, enterprise-grade environment for deploying, evaluating, and managing both Microsoft and custom models, with features like agent orchestration, evaluation, and integration with Microsoft’s cloud ecosystem. Foundry can also include approved marketplace models.
            </p>
          </div>
        </section>
        <section className="flex items-start gap-6 mb-2">
          <span className="mt-1"><svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" fill="#fef9c3"/><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8M12 8v8" /></svg></span>
          <div>
            <h3 className="text-xl font-semibold mb-1">Marketplace Models <a href="https://azuremarketplace.microsoft.com/en-us/marketplace/apps?filters=ai-machine-learning" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-base ml-2">Learn more</a></h3>
            <p className="text-gray-700">
              Marketplace models are AI models published by third parties or independent vendors, often available through platforms like Azure Marketplace or Hugging Face Hub. Foundry can support marketplace models if they are approved and integrated into your organization’s Foundry environment.
            </p>
          </div>
        </section>

        {/* SDK Section */}
        <section className="flex flex-col gap-4 mt-8">
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-7 h-7 text-blue-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="4" fill="#dbeafe"/><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8M12 8v8" /></svg>
            <h3 className="text-xl font-bold">Foundry SDKs <a href="https://learn.microsoft.com/en-us/azure/ai-foundry/how-to/develop/sdk-overview" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-base font-normal ml-2">Learn more</a></h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <a href="https://pypi.org/project/foundry-sdk/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-white border border-blue-100 rounded-xl shadow hover:shadow-md transition">
              <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" alt="Python" className="w-8 h-8" />
              <span className="font-semibold text-blue-900">Python SDK</span>
            </a>
            <a href="https://www.npmjs.com/package/foundry-sdk" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-white border border-blue-100 rounded-xl shadow hover:shadow-md transition">
              <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" alt="JavaScript" className="w-8 h-8" />
              <span className="font-semibold text-blue-900">JavaScript SDK</span>
            </a>
            <a href="https://www.nuget.org/packages/Foundry.SDK/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-white border border-blue-100 rounded-xl shadow hover:shadow-md transition">
              <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg" alt=".NET" className="w-8 h-8" />
              <span className="font-semibold text-blue-900">.NET SDK</span>
            </a>
          </div>

          {/* Agentic Framework SDKs */}
          <div className="flex items-center gap-3 mb-2 mt-4">
            <svg className="w-7 h-7 text-teal-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="#ccfbf1" stroke="currentColor" strokeWidth="2"/><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" /></svg>
            <h3 className="text-xl font-bold">Agentic Framework SDKs <a href="https://learn.microsoft.com/en-us/azure/ai-foundry/concepts/agents" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-base font-normal ml-2">Learn more</a></h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <a href="https://learn.microsoft.com/en-us/semantic-kernel/overview/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-white border border-teal-100 rounded-xl shadow hover:shadow-md transition">
              <svg className="w-8 h-8 text-teal-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="12,3 22,21 2,21" fill="#ccfbf1"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v5M12 17h.01" /></svg>
              <span className="font-semibold text-teal-900">Semantic Kernel</span>
            </a>
            <a href="https://microsoft.github.io/autogen/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-white border border-teal-100 rounded-xl shadow hover:shadow-md transition">
              <svg className="w-8 h-8 text-teal-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="3" fill="#ccfbf1"/><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8M12 8v8" /></svg>
              <span className="font-semibold text-teal-900">AutoGen</span>
            </a>
            <a href="https://learn.microsoft.com/en-us/azure/ai-services/agents/quickstart" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-white border border-teal-100 rounded-xl shadow hover:shadow-md transition">
              <svg className="w-8 h-8 text-teal-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#ccfbf1"/><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" /></svg>
              <span className="font-semibold text-teal-900">Azure AI Agent Service</span>
            </a>
          </div>
        </section>
      </div>

      {/* Framework Comparison */}
      <div className="w-full bg-white border border-gray-200 rounded-2xl p-10 mb-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <svg className="w-7 h-7 text-indigo-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 0-2 2h-2a2 2 0 0 1-2-2z" /></svg>
          <h3 className="text-xl font-bold text-gray-900">Open Source vs Microsoft: Framework Comparison</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* LangChain vs Semantic Kernel */}
          <div className="flex flex-col gap-3 p-5 rounded-xl border border-gray-100 bg-gray-50">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wide text-orange-500">Open Source</span>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-orange-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 0 0-5.656 0l-4 4a4 4 0 1 0 5.656 5.656l1.102-1.101"/><path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 0 0 5.656 0l4-4a4 4 0 1 0-5.656-5.656l-1.1 1.1"/></svg>
                <a href="https://python.langchain.com/" target="_blank" rel="noopener noreferrer" className="font-bold text-orange-700 hover:underline">LangChain</a>
              </div>
              <p className="text-sm text-gray-600">Chain-based agent orchestration with a vast ecosystem of integrations. Python &amp; JS. Works with any LLM provider.</p>
            </div>
            <div className="border-t border-dashed border-gray-300 pt-3 flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wide text-blue-600">Microsoft</span>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="12,3 22,21 2,21" fill="#dbeafe"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v5M12 17h.01"/></svg>
                <a href="https://learn.microsoft.com/en-us/semantic-kernel/overview/" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-700 hover:underline">Semantic Kernel</a>
              </div>
              <p className="text-sm text-gray-600">Enterprise-grade orchestration in Python, C#, and Java. Deep Azure integration, plugin architecture, and Microsoft security.</p>
            </div>
            <div className="mt-auto pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500"><span className="font-semibold">Key difference:</span> LangChain has a broader open ecosystem; Semantic Kernel is purpose-built for Azure enterprise environments.</p>
            </div>
          </div>

          {/* LangGraph vs AutoGen */}
          <div className="flex flex-col gap-3 p-5 rounded-xl border border-gray-100 bg-gray-50">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wide text-orange-500">Open Source</span>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-orange-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="6" cy="12" r="2" fill="#fed7aa"/><circle cx="18" cy="6" r="2" fill="#fed7aa"/><circle cx="18" cy="18" r="2" fill="#fed7aa"/><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8M16 8l-6 4M16 16l-6-4"/></svg>
                <a href="https://langchain-ai.github.io/langgraph/" target="_blank" rel="noopener noreferrer" className="font-bold text-orange-700 hover:underline">LangGraph</a>
              </div>
              <p className="text-sm text-gray-600">Graph-based stateful multi-agent workflows. Nodes and edges define agent steps, enabling loops, branches, and fine-grained state control.</p>
            </div>
            <div className="border-t border-dashed border-gray-300 pt-3 flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wide text-blue-600">Microsoft</span>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="3" fill="#dbeafe"/><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8M12 8v8"/></svg>
                <a href="https://microsoft.github.io/autogen/" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-700 hover:underline">AutoGen</a>
              </div>
              <p className="text-sm text-gray-600">Conversation-driven multi-agent framework from Microsoft Research. Agents communicate via messages; supports human-in-the-loop and autonomous modes.</p>
            </div>
            <div className="mt-auto pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500"><span className="font-semibold">Key difference:</span> LangGraph models workflows as explicit graphs; AutoGen uses flexible conversation patterns between agents.</p>
            </div>
          </div>

          {/* CrewAI vs Azure AI Agent Service */}
          <div className="flex flex-col gap-3 p-5 rounded-xl border border-gray-100 bg-gray-50">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wide text-orange-500">Open Source</span>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-orange-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 0 0-3-3.87M9 20H4v-2a4 4 0 0 1 3-3.87m9-5a4 4 0 1 0-8 0 4 4 0 0 0 8 0zm-4 4v4" fill="none"/></svg>
                <a href="https://www.crewai.com/" target="_blank" rel="noopener noreferrer" className="font-bold text-orange-700 hover:underline">CrewAI</a>
              </div>
              <p className="text-sm text-gray-600">Role-based multi-agent "crews" where each agent has a defined role, goal, and backstory. Intuitive Python API for building collaborative agent teams.</p>
            </div>
            <div className="border-t border-dashed border-gray-300 pt-3 flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wide text-blue-600">Microsoft</span>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#dbeafe"/><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4"/></svg>
                <a href="https://learn.microsoft.com/en-us/azure/ai-services/agents/quickstart" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-700 hover:underline">Azure AI Agent Service</a>
              </div>
              <p className="text-sm text-gray-600">Fully managed cloud service for building agents with built-in tools (code interpreter, file search, Bing grounding). Enterprise security and Azure scale out of the box.</p>
            </div>
            <div className="mt-auto pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500"><span className="font-semibold">Key difference:</span> CrewAI is self-hosted with intuitive role definitions; Azure AI Agent Service is managed infrastructure with enterprise-grade tooling.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

