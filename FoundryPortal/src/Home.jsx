
import React from "react";
import WelcomeBanner from "./WelcomeBanner";
import { useIsAuthenticated } from '@azure/msal-react';

export default function Home({ subscriptionRoles, cognitiveRoles, azureAiRoles }) {
  const isAuthenticated = useIsAuthenticated();
  const subRoles = Array.isArray(subscriptionRoles) ? subscriptionRoles : [];
  const cogRoles = Array.isArray(cognitiveRoles) ? cognitiveRoles : [];
  const aiRoles = Array.isArray(azureAiRoles) ? azureAiRoles : [];

  return (
    <div className="w-full max-w-full">
      {/* Welcome Banner full-width section */}
      <div className="w-full max-w-full bg-blue-50 border border-blue-100 rounded-2xl p-2 md:p-3 mb-8 shadow-sm text-left">
        <WelcomeBanner>
          {isAuthenticated && (
            <div className="flex flex-col md:flex-row gap-2 mt-4 justify-center items-center">
              {subRoles.length > 0 && (
                <div className="bg-blue-100 border border-blue-300 rounded-xl px-4 py-2 text-blue-900 text-sm font-semibold shadow-sm">
                  Subscription Roles: {subRoles.join(", ")}
                </div>
              )}
              {cogRoles.length > 0 && (
                <div className="bg-teal-100 border border-teal-300 rounded-xl px-4 py-2 text-teal-900 text-sm font-semibold shadow-sm">
                  Cognitive Roles: {cogRoles.join(", ")}
                </div>
              )}
              {aiRoles.length > 0 && (
                <div className="bg-yellow-100 border border-yellow-300 rounded-xl px-4 py-2 text-yellow-900 text-sm font-semibold shadow-sm">
                  Azure AI Roles: {aiRoles.join(", ")}
                </div>
              )}
            </div>
          )}
        </WelcomeBanner>
      </div>

      {/* Agents Section - Agent Kinds wrapper */}
      <div className="w-full max-w-full bg-teal-100 border border-teal-300 rounded-2xl p-2 md:p-6 mb-8 shadow-sm">
        <h2 className="text-xl font-bold text-teal-900 mb-5">Agents</h2>
        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          {/* Deployment Stage Block */}
          <div className="flex-1 min-w-0 bg-white border border-teal-100 rounded-2xl p-2 md:p-6 shadow-sm flex flex-col mb-4 md:mb-0">
            <h3 className="text-lg font-bold text-teal-800 mb-3">Foundry Agents</h3>
            <div className="flex flex-col gap-3">
              {/* Published Agents */}
              <div className="flex flex-col items-start gap-1 bg-teal-50 border border-teal-100 rounded-xl p-2 shadow-sm">
                <span className="mt-0.5"><svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="3" fill="#bbf7d0"/><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8M12 8v8" /></svg></span>
                <h4 className="text-base font-semibold">Published Agents</h4>
                <p className="text-gray-700 text-sm">Agents that are live and available for use in foundry. Agents that can be published to websites including Teams. 
                  These have passed all required checks and are ready for production. They can either define tools in code 
                  or pull standardized tool definintions from Foundry.</p>
              </div>
              {/* Unpublished Agents */}
              <div className="flex flex-col items-start gap-1 bg-teal-50 border border-teal-100 rounded-xl p-2 shadow-sm">
                <span className="mt-0.5"><svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="3" fill="#f3f4f6"/><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8M12 8v8" /></svg></span>
                <h4 className="text-base font-semibold">Unpublished Agents</h4>
                <p className="text-gray-700 text-sm">Agents that are in development or review. These are not yet available for general use. An Admin can play with these agents and test the models with zero code written</p>
              </div>
            </div>
          </div>

         

         
          {/* Custom & Marketplace Agents Block */}
          <div className="flex-1 min-w-0 bg-white border border-teal-100 rounded-2xl p-2 md:p-6 shadow-sm flex flex-col">
            <h3 className="text-lg font-bold text-teal-800 mb-3">Custom & Marketplace Agents</h3>
            <div className="flex flex-col gap-3">
              {/* Custom Agents */}
              <div className="flex flex-col items-start gap-1 bg-teal-50 border border-teal-100 rounded-xl p-2 shadow-sm">
                <span className="mt-0.5"><svg className="w-7 h-7 text-indigo-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="3" fill="#e0e7ff"/><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8M12 8v8" /></svg></span>
                <h4 className="text-base font-semibold">Custom Agents</h4>
                <p className="text-gray-700 text-sm">Agents that are custom-built for your organization’s unique needs. These can be tailored for specific workflows, integrations, or business processes. Custom agents can be hosted on a variety of Azure runtimes, including <span className='font-semibold'>Azure Function Apps</span> for event-driven workloads, <span className='font-semibold'>Azure Container Apps</span> for scalable microservices, or <span className='font-semibold'>Azure Kubernetes Service (AKS)</span> for advanced orchestration and enterprise scenarios.</p>
              </div>
              {/* Marketplace Agents */}
              <div className="flex flex-col items-start gap-1 bg-teal-50 border border-teal-100 rounded-xl p-2 shadow-sm">
                <span className="mt-0.5"><svg className="w-7 h-7 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" fill="#fef9c3"/><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8M12 8v8" /></svg></span>
              
                 <h4 className="text-base font-semibold">Marketplace Agents <a href="https://azuremarketplace.microsoft.com/en-us/marketplace/apps?filters=ai-machine-learning" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-xs font-normal ml-2">Learn more</a></h4>
                 <p className="text-gray-700 text-sm">Agents available from third-party vendors or the marketplace. These agents can be integrated into your environment if approved by your organization.</p>
              </div>
            </div>
          </div>
           {/* Single Agents Block */}
          <div className="flex-1 min-w-0 bg-white border border-teal-100 rounded-2xl p-2 md:p-6 shadow-sm flex flex-col mb-4 md:mb-0">
            <h3 className="text-lg font-bold text-teal-800 mb-3">Agent Usage</h3>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col items-start gap-1 bg-teal-50 border border-teal-100 rounded-xl p-2 shadow-sm">
                <span className="mt-0.5">
                  {/* Single Agent Icon: User silhouette */}
                  <svg className="w-7 h-7 text-cyan-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="8" r="4" fill="#a5f3fc" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 20c0-2.5 3.5-4.5 8-4.5s8 2 8 4.5" fill="#e0f2fe" />
                  </svg>
                </span>
                <h4 className="text-base font-semibold">Single Agent</h4>
                <p className="text-gray-700 text-sm">A single agent operates independently to complete a task or workflow. It uses its own tools, memory, and logic to solve problems, answer questions, or automate processes. Single agents are ideal for focused, well-defined tasks.</p>
              </div>
               {/* Multi Agents Block */}
          
           
            <div className="flex flex-col gap-3">
              <div className="flex flex-col items-start gap-1 bg-teal-50 border border-teal-100 rounded-xl p-2 shadow-sm">
                <span className="mt-0.5">
                  {/* Multi-Agent System Icon: Three user silhouettes */}
                  <svg className="w-7 h-7 text-fuchsia-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="8" cy="10" r="3" fill="#f0abfc" />
                    <circle cx="16" cy="10" r="3" fill="#f0abfc" />
                    <circle cx="12" cy="16" r="3" fill="#f0abfc" />
                  </svg>
                </span>
                <h4 className="text-base font-semibold">Multi-Agent System</h4>
                <p className="text-gray-700 text-sm">A multi-agent system coordinates two or more agents that collaborate or compete to solve complex problems. Agents may communicate, share knowledge, or divide tasks. Multi-agent setups are used for workflows requiring specialization, negotiation, or parallelism.</p>
              </div>
            </div>
          
            </div>
            
          </div>
        </div>
      </div>
      {/* Agentic AI Framework Comparison */}
      <div className="w-full max-w-full bg-white border border-gray-200 rounded-2xl p-2 md:p-10 mb-8 shadow-sm overflow-x-auto">
        <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
          <svg className="w-7 h-7 text-indigo-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 0-2 2h-2a2 2 0 0 1-2-2z" /></svg>
          <h3 className="text-xl font-bold text-gray-900">Agentic AI Framework Comparison</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-6">
          {/* LangChain vs Semantic Kernel */}
          <div className="flex flex-col gap-3 p-5 rounded-xl border border-gray-100 bg-gray-50">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wide text-orange-500">Open Source</span>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-orange-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#fed7aa"/><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8M12 8v8" /></svg>
                <a href="https://www.langchain.com/" target="_blank" rel="noopener noreferrer" className="font-bold text-orange-700 hover:underline">LangChain</a>
              </div>
              <p className="text-sm text-gray-600">Popular Python/JS framework for building LLM-powered applications and agentic workflows. Provides chains, tools, memory, and integrations for rapid prototyping.</p>
            </div>
            <div className="border-t border-dashed border-gray-300 pt-3 flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wide text-blue-600 flex items-center gap-1">
                <svg width="16" height="16" viewBox="0 0 32 32" className="inline-block align-middle mr-1"><rect x="2" y="2" width="13" height="13" fill="#F25022"/><rect x="17" y="2" width="13" height="13" fill="#7FBA00"/><rect x="2" y="17" width="13" height="13" fill="#00A4EF"/><rect x="17" y="17" width="13" height="13" fill="#FFB900"/></svg>
                Microsoft
              </span>
              <div className="flex items-center gap-2">
                <a href="https://learn.microsoft.com/en-us/semantic-kernel/" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-700 hover:underline">Semantic Kernel</a>
              </div>
              <p className="text-sm text-gray-600">Microsoft’s open-source SDK for orchestrating AI plugins, skills, and agents. Deep integration with Microsoft ecosystem, supports C#, Python, and Java.</p>
            </div>
            <div className="mt-auto pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500"><span className="font-semibold">Key difference:</span> LangChain is the most popular open-source agent framework; Semantic Kernel is Microsoft’s official SDK for agentic orchestration and plugin integration.</p>
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
              <span className="text-xs font-bold uppercase tracking-wide text-blue-600 flex items-center gap-1">
                <svg width="16" height="16" viewBox="0 0 32 32" className="inline-block align-middle mr-1"><rect x="2" y="2" width="13" height="13" fill="#F25022"/><rect x="17" y="2" width="13" height="13" fill="#7FBA00"/><rect x="2" y="17" width="13" height="13" fill="#00A4EF"/><rect x="17" y="17" width="13" height="13" fill="#FFB900"/></svg>
                Microsoft
              </span>
              <div className="flex items-center gap-2">
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
              <span className="text-xs font-bold uppercase tracking-wide text-blue-600 flex items-center gap-1">
                <svg width="16" height="16" viewBox="0 0 32 32" className="inline-block align-middle mr-1"><rect x="2" y="2" width="13" height="13" fill="#F25022"/><rect x="17" y="2" width="13" height="13" fill="#7FBA00"/><rect x="2" y="17" width="13" height="13" fill="#00A4EF"/><rect x="17" y="17" width="13" height="13" fill="#FFB900"/></svg>
                Microsoft
              </span>
              <div className="flex items-center gap-2">
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

      {/* Model Types Section */}
      <div className="w-full max-w-full bg-blue-50 border border-blue-100 rounded-2xl p-2 md:p-3 mb-4 shadow-sm text-left flex flex-col gap-2 md:gap-4">
        <h2 className="text-2xl font-bold mb-2 text-blue-900">Model Types</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {/* MaaS (Model as a Service) with OpenAI Models and Cognitive Services nested as text */}
          <div className="flex flex-col items-start gap-1 bg-white border border-blue-100 rounded-xl p-2 shadow-sm col-span-1 md:col-span-2">
            <span className="mt-1"><svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" fill="#bbf7d0"/><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8M12 8v8" /></svg></span>
            <h3 className="text-lg font-semibold">(1) MaaS (Model as a Service) <a href="https://azure.microsoft.com/en-us/products/ai-services/openai-service" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm ml-2">Learn more</a></h3>
            <p className="text-gray-700 text-sm mb-2">Model as a Service (MaaS) is a cloud-based approach where AI/ML models are hosted and served via APIs. Users can access, deploy, and scale models without managing the underlying infrastructure. OpenAI, Azure OpenAI, Cognitive Services, and Foundry all provide MaaS, handling hosting, scaling, and monitoring for you.</p>
            <div className="ml-4 mt-1 flex flex-col gap-2 w-full">
              <div>
                <span className="font-semibold">OpenAI Models</span> <a href="https://platform.openai.com/docs/models" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-xs font-normal ml-2">Learn more</a>
                <p className="text-gray-700 text-xs ml-2">OpenAI models (like GPT-3, GPT-4, DALL·E) are a subset of MaaS, accessed via API endpoints and keys. They are hosted by OpenAI or Azure and used for tasks such as text generation, summarization, code completion, and image generation.</p>
              </div>
              <div>
                <span className="font-semibold text-sm md:text-base">Cognitive Services</span> <a href="https://learn.microsoft.com/en-us/azure/cognitive-services/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm font-normal ml-2">Learn more</a>
                <p className="text-gray-700 text-sm ml-2">Azure Cognitive Services are a suite of pre-built AI APIs for vision, speech, language, decision, and search tasks. They are delivered as MaaS, accessed via REST APIs and keys, and require no model training or infrastructure management.</p>
                <ul className="list-disc pl-6 text-gray-700 text-sm mt-1 ml-2 font-normal">
                  <li><span className="font-semibold">Vision:</span> Computer Vision, Face</li>
                  <li><span className="font-semibold">Speech:</span> Speech-to-Text, Text-to-Speech, Speech Translation</li>
                  <li><span className="font-semibold">Language:</span> Text Analytics, Translator, QnA Maker, Language Understanding (LUIS)</li>
                  <li><span className="font-semibold">Decision:</span> Personalizer, Content Moderator, Anomaly Detector</li>
                  <li><span className="font-semibold">AI Search & Document Intelligence:</span> Azure AI Search, Document Intelligence (Form Recognizer, OCR)</li>
                </ul>
              </div>
            </div>
          </div>
          {/* Microsoft Foundry Models */}
          <div className="flex flex-col items-start gap-1 bg-white border border-blue-100 rounded-xl p-2 shadow-sm">
            <span className="mt-1"><svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" fill="#ede9fe"/><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8M12 8v8" /></svg></span>
            <h3 className="text-lg font-semibold">(2) Microsoft Foundry Models <a href="https://learn.microsoft.com/en-us/fabric/ai-services/foundry/overview" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm ml-2">Learn more</a></h3>
            <p className="text-gray-700 text-sm">Foundry models are AI models hosted and managed within Microsoft’s Foundry platform. Foundry provides a secure, enterprise-grade environment for deploying, evaluating, and managing both Microsoft and custom models, with features like agent orchestration, evaluation, and integration with Microsoft’s cloud ecosystem. Foundry can also include approved marketplace models.</p>
          </div>
          {/* Marketplace Models */}
          <div className="flex flex-col items-start gap-1 bg-white border border-blue-100 rounded-xl p-2 shadow-sm">
            <span className="mt-1"><svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" fill="#fef9c3"/><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8M12 8v8" /></svg></span>
            <h3 className="text-lg font-semibold">(3) Marketplace Models <a href="https://azuremarketplace.microsoft.com/en-us/marketplace/apps?filters=ai-machine-learning" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm ml-2">Learn more</a></h3>
            <p className="text-gray-700 text-sm">Marketplace models are AI models published by third parties or independent vendors, often available through platforms like Azure Marketplace or Hugging Face Hub. Foundry can support marketplace models if they are approved and integrated into your organization’s Foundry environment.</p>
          </div>
          {/* Model Hosting & Deployment Table - spans both columns */}
        </div>
        <div className="col-span-1 md:col-span-2 lg:col-span-2 w-full mt-4">
          <h4 className="text-base font-bold mb-2 text-blue-900">Model Hosting & Deployment</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border border-blue-200 rounded-xl">
              <thead>
                <tr className="bg-blue-50">
                  <th className="px-3 py-2 border-b text-left font-semibold">Model Type</th>
                  <th className="px-3 py-2 border-b text-left font-semibold">Hosting/Deployment</th>
                  <th className="px-3 py-2 border-b text-left font-semibold">Access Pattern</th>
                  <th className="px-3 py-2 border-b text-left font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-3 py-2 border-b">(1) MaaS (Model as a Service)</td>
                  <td className="px-3 py-2 border-b">Hosted by provider (Azure, OpenAI, Foundry)</td>
                  <td className="px-3 py-2 border-b">API endpoint, managed keys</td>
                  <td className="px-3 py-2 border-b">No infra to manage; scalable; includes OpenAI Models</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 border-b pl-6">OpenAI Models</td>
                  <td className="px-3 py-2 border-b">Hosted by OpenAI or Azure</td>
                  <td className="px-3 py-2 border-b">API endpoint, access via keys</td>
                  <td className="px-3 py-2 border-b">Subset of MaaS; accessed via OpenAI/Azure OpenAI</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 border-b">(2) Microsoft Foundry Models</td>
                  <td className="px-3 py-2 border-b">Hosted in Microsoft Foundry</td>
                  <td className="px-3 py-2 border-b">Foundry APIs, portal, or agent integration</td>
                  <td className="px-3 py-2 border-b">Enterprise controls, agent orchestration</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 border-b">(3) Marketplace Models</td>
                  <td className="px-3 py-2 border-b">Provider-hosted (MaaS) or self-hosted (AKS, Function App, Container, etc.) or stored in private registry (e.g., JFrog)</td>
                  <td className="px-3 py-2 border-b">API, direct deployment, or custom runtime</td>
                  <td className="px-3 py-2 border-b">Flexible: can be integrated as MaaS or deployed in your org’s runtime</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>


      {/* Foundry Connections & Tools Side by Side */}
      <div className="w-full max-w-full flex flex-col md:flex-row gap-4 mb-8">
        {/* Foundry Connections Section */}
        <div className="flex-1 bg-white border border-blue-200 rounded-2xl p-2 md:p-6 shadow-sm text-left flex flex-col gap-2 mb-4 md:mb-0">
          <h2 className="text-2xl font-bold mb-2 text-blue-900">Foundry Connections
              <a href="https://learn.microsoft.com/en-us/azure/foundry/how-to/connections-add?tabs=foundry-portal" target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 underline text-base font-normal align-middle">Learn More</a>
          </h2>
          <p className="text-gray-700 text-base">Connect your Foundry environment to external data sources, APIs, and enterprise systems. Foundry Connections enable secure, governed integration with databases, storage accounts, REST APIs, and more. Use connections to power agents, models, and workflows with real-time or batch data.</p>
          <ul className="list-disc pl-6 text-gray-700 text-sm mt-2">
            <li>Azure SQL, Cosmos DB, Blob Storage, Data Lake</li>
            <li>REST APIs, Webhooks, Event Grid</li>
            <li>Enterprise connectors (SAP, Salesforce, ServiceNow, etc.)</li>
            <li>Bring your own connection via custom code or plugins</li>
          </ul>
        </div>
        {/* Foundry Tools Section */}
        <div className="flex-1 bg-white border border-blue-200 rounded-2xl p-2 md:p-6 shadow-sm text-left flex flex-col gap-2">
          <h2 className="text-2xl font-bold mb-2 text-blue-900">Foundry Tools
              <a href="https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/tool-catalog" target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 underline text-base font-normal align-middle">Learn More</a>
          </h2>
          <p className="text-gray-700 text-base">Foundry Tools are reusable functions, plugins, and skills that agents and models can invoke to interact with external systems, perform computations, or automate tasks. Tools extend what your agents can do in Microsoft Foundry Agent Service. An agent on its own can generate text, but tools let it take action - searching the web, running code, querying your data, or calling your own APIs.</p>
          <ul className="list-disc pl-6 text-gray-700 text-sm mt-2">
            <li>Built-in tools: code interpreter, file search, Bing grounding, web browsing</li>
            <li>Marketplace tools: third-party plugins, SaaS integrations</li>
            <li>Custom tools: organization-specific APIs, business logic, workflow automation</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

