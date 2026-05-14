import React, { useState, useEffect } from 'react';
import { useIsAuthenticated } from '@azure/msal-react';
import { fetchModels } from '../api/ModelsApi';
import { fetchProjects } from '../api/ProjectsApi';
import ConsumptionPanel from './ConsumptionPanel';

const TASK_COLORS = {
  'Chat':          'bg-blue-100 text-blue-700 border-blue-200',
  'Text':          'bg-indigo-100 text-indigo-700 border-indigo-200',
  'Code':          'bg-green-100 text-green-700 border-green-200',
  'Vision':        'bg-purple-100 text-purple-700 border-purple-200',
  'Reasoning':     'bg-orange-100 text-orange-700 border-orange-200',
  'Embeddings':    'bg-teal-100 text-teal-700 border-teal-200',
  'Multilingual':  'bg-rose-100 text-rose-700 border-rose-200',
  'Local':         'bg-yellow-100 text-yellow-700 border-yellow-200',
  'Custom':        'bg-gray-100 text-gray-600 border-gray-200',
};

const TaskBadge = ({ label }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${TASK_COLORS[label] || TASK_COLORS['Custom']}`}>
    {label}
  </span>
);

const MaaSBadge = () => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200">
    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"/>
    </svg>
    MaaS
  </span>
);

const ProvisionedStar = () => (
  <span title="Deployed in your Foundry" className="inline-flex items-center">
    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  </span>
);

const ModelCard = ({ name, description, tasks = [], learnMore, sub, maas, provisioned }) => (
  <div className={`bg-white border rounded-xl p-4 shadow-sm flex flex-col gap-2 hover:shadow-md transition-shadow ${provisioned ? 'border-yellow-300 ring-1 ring-yellow-200' : 'border-gray-100'}`}>
    <div className="flex items-start justify-between gap-2">
      <div className="flex items-center gap-1.5 min-w-0">
        {provisioned && <ProvisionedStar />}
        <p className="text-sm font-bold text-gray-800 leading-tight">{name}</p>
      </div>
      {learnMore && (
        <a href={learnMore} target="_blank" rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:underline shrink-0">docs ↗</a>
      )}
    </div>
    {sub && <p className="text-xs text-gray-400 -mt-1">{sub}</p>}
    <p className="text-xs text-gray-600 leading-relaxed flex-1">{description}</p>
    <div className="flex flex-wrap gap-1 mt-auto pt-1">
      {maas && <MaaSBadge />}
      {tasks.map(t => <TaskBadge key={t} label={t} />)}
    </div>
  </div>
);

const SectionHeader = ({ color, icon, title, subtitle, count }) => {
  const themes = {
    blue:   { wrap: 'bg-blue-600',   text: 'text-blue-700',  sub: 'text-blue-600',  badge: 'bg-blue-100 text-blue-800 border-blue-200' },
    violet: { wrap: 'bg-violet-600', text: 'text-violet-700', sub: 'text-violet-600', badge: 'bg-violet-100 text-violet-800 border-violet-200' },
    teal:   { wrap: 'bg-teal-600',   text: 'text-teal-700',  sub: 'text-teal-600',  badge: 'bg-teal-100 text-teal-800 border-teal-200' },
  };
  const t = themes[color] || themes.blue;
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className={`w-10 h-10 ${t.wrap} rounded-xl flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className={`text-lg font-bold ${t.text}`}>{title}</h2>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${t.badge}`}>{count} models</span>
        </div>
        <p className={`text-xs ${t.sub} mt-0.5`}>{subtitle}</p>
      </div>
    </div>
  );
};

const FIRST_PARTY = [
  {
    name: 'GPT-4o',
    sub: 'Azure OpenAI',
    description: 'Flagship multimodal model with text, vision, and audio capabilities. Highest intelligence across the OpenAI lineup.',
    tasks: ['Chat', 'Vision', 'Code'],
    learnMore: 'https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models',
    maas: true,
    matchKeys: ['gpt-4o'],
  },
  {
    name: 'GPT-4o mini',
    sub: 'Azure OpenAI',
    description: 'Cost-efficient small multimodal model with strong text and vision performance for everyday tasks.',
    tasks: ['Chat', 'Vision'],
    learnMore: 'https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models',
    maas: true,
    matchKeys: ['gpt-4o-mini'],
  },
  {
    name: 'o1',
    sub: 'Azure OpenAI',
    description: 'Deliberate reasoning model. Spends more tokens thinking through complex STEM, coding, and logic problems.',
    tasks: ['Reasoning', 'Code'],
    learnMore: 'https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models',
    maas: true,
    matchKeys: ['o1'],
  },
  {
    name: 'o3-mini',
    sub: 'Azure OpenAI',
    description: 'Fast, cost-efficient reasoning model optimised for math, science, and code with configurable reasoning effort.',
    tasks: ['Reasoning', 'Code'],
    learnMore: 'https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models',
    maas: true,
    matchKeys: ['o3-mini'],
  },
  {
    name: 'Phi-4',
    sub: 'Microsoft Research',
    description: 'State-of-the-art small language model (14B). Excels at complex reasoning and instruction-following despite compact size.',
    tasks: ['Reasoning', 'Chat', 'Code'],
    learnMore: 'https://azure.microsoft.com/en-us/blog/phi-4-microsofts-newest-small-language-model-specializing-in-complex-reasoning/',
    maas: true,
    matchKeys: ['phi-4'],
  },
  {
    name: 'Phi-3.5-MoE Instruct',
    sub: 'Microsoft Research',
    description: '16×3.8B mixture-of-experts model matching performance of large models while activating only a fraction of parameters.',
    tasks: ['Chat', 'Code', 'Reasoning'],
    learnMore: 'https://azure.microsoft.com/en-us/blog/introducing-phi-3-5-moe-instruct-phi-3-5-vision-instruct/',
    maas: true,
    matchKeys: ['phi-3.5-moe'],
  },
  {
    name: 'Phi-3.5 Mini Instruct',
    sub: 'Microsoft Research',
    description: 'Lightweight 3.8B model with strong reasoning and long-context (128K) support. Great for edge and mobile use cases.',
    tasks: ['Chat', 'Code'],
    learnMore: 'https://azure.microsoft.com/en-us/blog/introducing-phi-3-5-moe-instruct-phi-3-5-vision-instruct/',
    maas: true,
    matchKeys: ['phi-3.5-mini'],
  },
  {
    name: 'Phi-3.5 Vision Instruct',
    sub: 'Microsoft Research',
    description: 'Multimodal small model combining text and single/multi-frame image understanding for visual reasoning tasks.',
    tasks: ['Vision', 'Chat'],
    learnMore: 'https://azure.microsoft.com/en-us/blog/introducing-phi-3-5-moe-instruct-phi-3-5-vision-instruct/',
    maas: true,
    matchKeys: ['phi-3.5-vision'],
  },
  {
    name: 'text-embedding-3-large',
    sub: 'Azure OpenAI',
    description: 'High-performance text embedding model for semantic search, clustering, and RAG applications.',
    tasks: ['Embeddings'],
    learnMore: 'https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models',
    maas: true,
    matchKeys: ['text-embedding-3-large'],
  },
];

const PARTNER = [
  {
    name: 'Llama 3.3 70B Instruct',
    sub: 'Meta · via Azure AI Foundry',
    description: "Meta's latest 70B model with strong multilingual instruction-following across text and code tasks.",
    tasks: ['Chat', 'Code', 'Multilingual'],
    learnMore: 'https://learn.microsoft.com/en-us/azure/ai-foundry/how-to/deploy-models-llama',
    maas: true,
    matchKeys: ['llama-3.3-70b', 'meta-llama-3.3'],
  },
  {
    name: 'Llama 3.2 11B Vision Instruct',
    sub: 'Meta · via Azure AI Foundry',
    description: 'Multimodal model combining Llama language capability with vision understanding for image+text tasks.',
    tasks: ['Vision', 'Chat'],
    learnMore: 'https://learn.microsoft.com/en-us/azure/ai-foundry/how-to/deploy-models-llama',
    maas: true,
    matchKeys: ['llama-3.2-11b', 'llama-3.2-11b-vision'],
  },
  {
    name: 'Llama 3.1 405B Instruct',
    sub: 'Meta · via Azure AI Foundry',
    description: "Meta's frontier 405B model — top-tier open-weight model for complex reasoning, research, and synthesis.",
    tasks: ['Chat', 'Reasoning', 'Code'],
    learnMore: 'https://learn.microsoft.com/en-us/azure/ai-foundry/how-to/deploy-models-llama',
    maas: true,
    matchKeys: ['llama-3.1-405b', 'meta-llama-3.1-405b'],
  },
  {
    name: 'Mistral Large (2407)',
    sub: 'Mistral AI · via Azure AI Foundry',
    description: 'Top-tier reasoning model from Mistral with strong multilingual and coding capabilities.',
    tasks: ['Chat', 'Code', 'Multilingual'],
    learnMore: 'https://learn.microsoft.com/en-us/azure/ai-foundry/how-to/deploy-models-mistral',
    maas: true,
    matchKeys: ['mistral-large'],
  },
  {
    name: 'Mistral Small',
    sub: 'Mistral AI · via Azure AI Foundry',
    description: 'Cost-efficient, fast model for translation, summarisation, and classification tasks at scale.',
    tasks: ['Chat', 'Text'],
    learnMore: 'https://learn.microsoft.com/en-us/azure/ai-foundry/how-to/deploy-models-mistral',
    maas: true,
    matchKeys: ['mistral-small'],
  },
  {
    name: 'Mixtral 8x22B Instruct',
    sub: 'Mistral AI · via Azure AI Foundry',
    description: 'Sparse mixture-of-experts model with 141B total parameters. State-of-the-art open-weight performance.',
    tasks: ['Chat', 'Code', 'Reasoning'],
    learnMore: 'https://learn.microsoft.com/en-us/azure/ai-foundry/how-to/deploy-models-mistral',
    maas: true,
    matchKeys: ['mixtral-8x22b', 'mixtral'],
  },
  {
    name: 'Command R+',
    sub: 'Cohere · via Azure AI Foundry',
    description: 'Enterprise-grade model optimised for RAG, tool use, and multi-step agentic workflows.',
    tasks: ['Chat', 'Text', 'Reasoning'],
    learnMore: 'https://learn.microsoft.com/en-us/azure/ai-foundry/how-to/deploy-models-cohere-command',
    maas: true,
    matchKeys: ['command-r-plus', 'cohere-command-r-plus'],
  },
  {
    name: 'Cohere Embed v3',
    sub: 'Cohere · via Azure AI Foundry',
    description: 'Best-in-class multilingual embedding model for semantic search and retrieval-augmented generation.',
    tasks: ['Embeddings', 'Multilingual'],
    learnMore: 'https://learn.microsoft.com/en-us/azure/ai-foundry/how-to/deploy-models-cohere-embed',
    maas: true,
    matchKeys: ['cohere-embed', 'embed-v3'],
  },
  {
    name: 'Jamba 1.5 Large',
    sub: 'AI21 Labs · via Azure AI Foundry',
    description: 'Hybrid SSM-Transformer architecture offering 256K context window with enterprise efficiency.',
    tasks: ['Chat', 'Text'],
    learnMore: 'https://learn.microsoft.com/en-us/azure/ai-foundry/how-to/deploy-models-jamba',
    maas: true,
    matchKeys: ['jamba-1.5', 'ai21-jamba'],
  },
  {
    name: 'Jais 30B Chat',
    sub: 'G42 · via Azure AI Foundry',
    description: 'Bilingual Arabic-English model from the UAE. Purpose-built for Arabic language understanding and generation.',
    tasks: ['Chat', 'Multilingual'],
    learnMore: 'https://learn.microsoft.com/en-us/azure/ai-foundry/how-to/deploy-models-jais',
    maas: true,
    matchKeys: ['jais-30b', 'jais'],
  },
];

const SELF_HOSTED = [
  {
    name: 'Phi-3.8B / Phi-mini',
    sub: 'Foundry Local — on-device',
    description: 'Ultra-compact Phi models optimised for CPU/NPU inference. Run entirely on your machine via Foundry Local with no data leaving the device.',
    tasks: ['Chat', 'Local'],
    learnMore: 'https://learn.microsoft.com/en-us/azure/foundry-local/get-started',
    matchKeys: ['phi-3.8b', 'phi-mini', 'phi-3-mini'],
  },
  {
    name: 'Qwen 2.5 (7B / 14B / 72B)',
    sub: 'Alibaba Cloud — Model Registry / Foundry Local',
    description: "Alibaba's open-weight series covering text, code, and math. Available via HuggingFace, the Foundry Model Registry, or Foundry Local.",
    tasks: ['Chat', 'Code', 'Reasoning', 'Local'],
    learnMore: 'https://huggingface.co/Qwen',
    matchKeys: ['qwen2.5', 'qwen-2.5'],
  },
  {
    name: 'DeepSeek R1 / V3',
    sub: 'DeepSeek — Model Registry / Foundry Local',
    description: 'Open-source reasoning and instruction models from DeepSeek. Competitive with frontier models on math and code benchmarks.',
    tasks: ['Reasoning', 'Code', 'Local'],
    learnMore: 'https://huggingface.co/deepseek-ai',
    matchKeys: ['deepseek-r1', 'deepseek-v3'],
  },
  {
    name: 'Mistral 7B / NeMo',
    sub: 'Mistral AI — HuggingFace / Model Registry',
    description: 'Community-favourite open weights. Deploy to Azure via Model Registry or run locally. NeMo variant is enterprise-licensed.',
    tasks: ['Chat', 'Code', 'Local'],
    learnMore: 'https://huggingface.co/mistralai',
    matchKeys: ['mistral-7b', 'mistral-nemo'],
  },
  {
    name: 'Llama 3.2 1B / 3B',
    sub: 'Meta — Foundry Local / Model Registry',
    description: 'Tiny, mobile-grade Llama models for on-device inference or resource-constrained deployments. Multilingual with vision variants.',
    tasks: ['Chat', 'Local'],
    learnMore: 'https://learn.microsoft.com/en-us/azure/foundry-local/get-started',
    matchKeys: ['llama-3.2-1b', 'llama-3.2-3b'],
  },
  {
    name: 'HuggingFace Hub models',
    sub: 'Community — Azure Model Registry',
    description: 'Any HuggingFace model can be registered in your Azure AI Model Registry, evaluated in Foundry, and deployed to managed endpoints or Foundry Local.',
    tasks: ['Custom'],
    learnMore: 'https://learn.microsoft.com/en-us/azure/machine-learning/how-to-create-model-packages-with-hugging-face',
    matchKeys: [],
  },
  {
    name: 'Custom fine-tuned models',
    sub: 'Your Azure AI Model Registry',
    description: 'Fine-tune any base model on your domain data using Azure AI Foundry fine-tuning, then register and deploy it as a versioned model asset within your project.',
    tasks: ['Custom'],
    learnMore: 'https://learn.microsoft.com/en-us/azure/ai-foundry/concepts/fine-tuning-overview',
    matchKeys: [],
  },
];

const CategorySection = ({ color, icon, title, subtitle, learnMoreUrl, models, borderClass, bgClass, deployedNames }) => {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? models : models.slice(0, 6);
  return (
    <div className={`w-full ${bgClass} border ${borderClass} rounded-2xl p-4 md:p-6 mb-6 shadow-sm`}>
      <SectionHeader color={color} icon={icon} title={title} subtitle={subtitle} count={models.length} />
      {learnMoreUrl && (
        <p className="text-xs text-gray-500 mb-4">
          <a href={learnMoreUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            Browse full catalog in Azure AI Foundry ↗
          </a>
        </p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {visible.map(m => (
          <ModelCard
            key={m.name}
            {...m}
            provisioned={isProvisioned(m.matchKeys, deployedNames)}
          />
        ))}
      </div>
      {models.length > 6 && (
        <button
          onClick={() => setShowAll(s => !s)}
          className="mt-4 text-xs font-semibold text-blue-600 hover:underline"
        >
          {showAll ? 'Show less' : `Show ${models.length - 6} more models`}
        </button>
      )}
    </div>
  );
};

const FIRST_PARTY_ICON = (
  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="2" y="2" width="9" height="9" rx="1" fill="#F25022" stroke="none"/>
    <rect x="13" y="2" width="9" height="9" rx="1" fill="#7FBA00" stroke="none"/>
    <rect x="2" y="13" width="9" height="9" rx="1" fill="#00A4EF" stroke="none"/>
    <rect x="13" y="13" width="9" height="9" rx="1" fill="#FFB900" stroke="none"/>
  </svg>
);

const PARTNER_ICON = (
  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
  </svg>
);

const SELF_HOSTED_ICON = (
  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12H3l9-9 9 9h-2M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/>
  </svg>
);

function buildDeployedNames(allModels = []) {
  const names = new Set();
  for (const m of allModels) {
    const modelName = (m.properties?.model?.name || '').toLowerCase();
    const deployName = (m.name || '').toLowerCase();
    if (modelName) names.add(modelName);
    if (deployName) names.add(deployName);
  }
  return names;
}

function isProvisioned(matchKeys = [], deployedNames) {
  return matchKeys.some(k => {
    if (deployedNames.has(k)) return true;
    for (const dn of deployedNames) {
      if (dn.startsWith(k) && (dn.length === k.length || /^[-_]\d/.test(dn.slice(k.length)))) return true;
    }
    return false;
  });
}

const STATE_STYLE = {
  Succeeded: 'bg-green-100 text-green-700 border-green-200',
  Failed:    'bg-red-100 text-red-700 border-red-200',
  Creating:  'bg-yellow-100 text-yellow-700 border-yellow-200',
};

const BENCHMARK_DIMENSIONS = [
  {
    id: 'quality',
    label: 'Quality',
    color: 'blue',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
      </svg>
    ),
    metric: 'Quality Index (0–1, higher = better)',
    description: 'Average accuracy across reasoning, coding, science, and knowledge benchmarks.',
    datasets: [
      { name: 'MMLU-Pro',         what: 'General knowledge — 1 000 examples across 57 subjects' },
      { name: 'BigBench-Hard',    what: 'Algorithmic & multi-step reasoning — 1 000 examples' },
      { name: 'GPQA',             what: 'Graduate-level science Q&A (biology, chemistry, physics)' },
      { name: 'MBPPplus',         what: 'Python coding correctness — pass@1 metric' },
      { name: 'FrontierScience',  what: 'Cutting-edge research comprehension' },
      { name: 'MuSR',             what: 'Multi-step soft reasoning over narratives' },
      { name: 'ChemBench',        what: 'Chemistry problem-solving' },
      { name: 'TAU2-Telecom',     what: 'Agentic tool-call selection in telecom domain' },
    ],
  },
  {
    id: 'safety',
    label: 'Safety',
    color: 'red',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
      </svg>
    ),
    metric: 'Attack Success Rate (lower = safer) · F1 (higher = better)',
    description: 'Resistance to adversarial prompts, harmful content generation, and sensitive knowledge leakage.',
    datasets: [
      { name: 'HarmBench (Standard)',    what: 'ASR — standard harmful behaviour jailbreak attempts' },
      { name: 'HarmBench (Contextual)',  what: 'ASR — context-dependent harmful scenarios' },
      { name: 'HarmBench (Copyright)',   what: 'ASR — copyright-violating content extraction' },
      { name: 'WMDP',                    what: 'Accuracy on CBRN sensitive knowledge (lower accuracy = safer)' },
      { name: 'ToxiGen',                 what: 'F1 — toxic content detection across demographic groups' },
    ],
  },
  {
    id: 'performance',
    label: 'Performance',
    color: 'green',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
      </svg>
    ),
    metric: 'Latency (ms) · Throughput (tokens/s) · TTFT (ms)',
    description: 'Inference speed and efficiency under standard load conditions.',
    datasets: [
      { name: 'Latency P50 / P90 / P95 / P99', what: 'End-to-end response time percentiles in milliseconds' },
      { name: 'TTFT',                           what: 'Time to First Token — perceived responsiveness' },
      { name: 'GTPS',                           what: 'Generated Tokens Per Second — output throughput' },
      { name: 'TTPS',                           what: 'Total Tokens Per Second — combined in+out throughput' },
    ],
  },
  {
    id: 'cost',
    label: 'Cost',
    color: 'emerald',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    ),
    metric: 'USD per benchmark run',
    description: 'Actual token cost to complete the full quality benchmark suite — a proxy for real-world inference cost.',
    datasets: [
      { name: 'Cost per benchmark run', what: 'USD based on token consumption across all quality datasets' },
    ],
  },
];

const DIM_COLORS = {
  blue:    { header: 'bg-blue-50 border-blue-100',   icon: 'bg-blue-500',    badge: 'bg-blue-50 text-blue-700 border-blue-100',   bar: 'bg-blue-400',   dot: 'text-blue-500'   },
  red:     { header: 'bg-red-50 border-red-100',     icon: 'bg-red-500',     badge: 'bg-red-50 text-red-700 border-red-100',     bar: 'bg-red-400',    dot: 'text-red-500'    },
  green:   { header: 'bg-green-50 border-green-100', icon: 'bg-green-500',   badge: 'bg-green-50 text-green-700 border-green-100', bar: 'bg-green-400',  dot: 'text-green-500'  },
  emerald: { header: 'bg-emerald-50 border-emerald-100', icon: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-100', bar: 'bg-emerald-400', dot: 'text-emerald-500' },
  purple:  { header: 'bg-purple-50 border-purple-100', icon: 'bg-purple-500', badge: 'bg-purple-50 text-purple-700 border-purple-100', bar: 'bg-purple-400', dot: 'text-purple-500' },
};

function BenchmarkDimension({ dim, open, onToggle }) {
  const c = DIM_COLORS[dim.color] || DIM_COLORS.purple;
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={onToggle}
        className={`w-full flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left`}
      >
        <span className={`w-5 h-5 rounded-md flex items-center justify-center text-white shrink-0 ${c.icon}`}>
          {dim.icon}
        </span>
        <span className="text-xs font-semibold text-gray-800 flex-1">{dim.label}</span>
        <span className={`text-xs px-1.5 py-0.5 rounded border ${c.badge} shrink-0`}>{dim.datasets.length} datasets</span>
        <svg className={`w-3 h-3 text-gray-400 transition-transform shrink-0 ${open ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
        </svg>
      </button>
      {open && (
        <div className="px-3 pb-3">
          <p className="text-xs text-gray-500 mb-2">{dim.description}</p>
          <p className={`text-xs font-medium mb-2 ${c.dot}`}>{dim.metric}</p>
          <div className="flex flex-col gap-1.5">
            {dim.datasets.map(ds => (
              <div key={ds.name} className="flex gap-2 items-start">
                <span className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${c.icon}`} />
                <div>
                  <span className="text-xs font-semibold text-gray-700">{ds.name}</span>
                  <span className="text-xs text-gray-400"> — {ds.what}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BenchmarkLeaderboard() {
  const [openDims, setOpenDims] = useState(() => new Set(BENCHMARK_DIMENSIONS.map(d => d.id)));

  const toggle = (id) => setOpenDims(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-purple-100 bg-purple-50">
        <svg className="w-4 h-4 text-purple-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
        </svg>
        <h2 className="text-sm font-bold text-purple-900 uppercase tracking-wide">Model Benchmarks</h2>
        <a
          href="https://learn.microsoft.com/en-us/azure/foundry/concepts/model-benchmarks"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto text-xs text-purple-600 hover:underline shrink-0"
        >
          Docs ↗
        </a>
      </div>

      {/* Benchmark dimensions — all expanded by default */}
      <div className="px-0 py-1">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 pt-2 pb-1">Benchmark Dimensions</p>
        {BENCHMARK_DIMENSIONS.map(dim => (
          <BenchmarkDimension
            key={dim.id}
            dim={dim}
            open={openDims.has(dim.id)}
            onToggle={() => toggle(dim.id)}
          />
        ))}
      </div>

      {/* Link to live leaderboard */}
      <div className="px-3 pb-3 pt-1">
        <a
          href="https://ai.azure.com/explore/models"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 w-full bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl px-3 py-2 transition-colors"
        >
          <svg className="w-4 h-4 text-purple-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
          </svg>
          <div>
            <p className="text-xs font-semibold text-purple-800">View live scores in Foundry Portal</p>
            <p className="text-xs text-purple-500">ai.azure.com/explore/models → Benchmarks tab</p>
          </div>
        </a>
      </div>
    </>
  );
}

function FoundryModelsGrid({ foundries, selectedSubscription, getAccessToken, onModelsLoaded }) {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!foundries.length || !selectedSubscription) {
      setRows([]);
      onModelsLoaded([]);
      return;
    }
    setLoading(true);
    setError(null);
    getAccessToken().then(async token => {
      if (!token) { setLoading(false); return; }

      // For each foundry: fetch projects, then fetch account-level + per-project deployments
      const foundryResults = await Promise.allSettled(
        foundries.map(async f => {
          const [accountData, projectList] = await Promise.allSettled([
            fetchModels(token, selectedSubscription, f.resource_group, f.name),
            fetchProjects(token, f.name, selectedSubscription, f.resource_group),
          ]);

          const accountModels = (accountData.status === 'fulfilled' ? accountData.value?.value : null) || [];
          const projects = (projectList.status === 'fulfilled' ? projectList.value : null) || [];

          // Fetch deployments for each project in parallel
          const projectResults = await Promise.allSettled(
            projects.map(p =>
              fetchModels(token, selectedSubscription, f.resource_group, f.name, '2025-06-01', p.name)
                .then(data => ({ project: p.name, models: data?.value || [] }))
            )
          );

          // Collect all project-scoped deployment names to avoid duplicating account-level rows
          const projectModelNames = new Set(
            projectResults
              .filter(r => r.status === 'fulfilled')
              .flatMap(r => r.value.models.map(m => m.name))
          );

          const rows = [
            // Account-level models not already represented at project level → "Shared"
            ...accountModels
              .filter(m => !projectModelNames.has(m.name))
              .map(m => ({ ...m, _foundry: f.name, _project: 'Shared' })),
            // Project-scoped models tagged with their project name
            ...projectResults
              .filter(r => r.status === 'fulfilled')
              .flatMap(r => r.value.models.map(m => ({ ...m, _foundry: f.name, _project: r.value.project }))),
          ];

          return rows;
        })
      );

      const combined = foundryResults
        .filter(r => r.status === 'fulfilled')
        .flatMap(r => r.value);

      setRows(combined);
      onModelsLoaded(combined);
      setLoading(false);
    }).catch(e => { setError(e.message); setLoading(false); });
  }, [foundries, selectedSubscription]);

  if (!selectedSubscription || !foundries.length) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 mb-6 bg-white border border-blue-100 rounded-2xl shadow-sm">
        <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin mb-3" />
        <p className="text-sm text-blue-500 font-medium">Loading deployed models across foundries…</p>
        <p className="text-xs text-gray-400 mt-1">Checking all foundries and projects</p>
      </div>
    );
  }
  if (error) {
    return <p className="text-xs text-red-500 mb-6">{error}</p>;
  }
  if (rows.length === 0) {
    return <p className="text-xs text-gray-400 italic mb-6">No model deployments found across your foundries.</p>;
  }

  // Group by foundry
  const grouped = {};
  for (const m of rows) {
    if (!grouped[m._foundry]) grouped[m._foundry] = [];
    grouped[m._foundry].push(m);
  }
  const foundryNames = Object.keys(grouped).sort();

  return (
    <div className="flex flex-col md:flex-row gap-3 mb-6 items-stretch">

      {/* Left card — Provisioned Models */}
      <div className="w-full md:w-3/5 min-w-0 bg-white border border-blue-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-blue-100 bg-blue-50">
          <svg className="w-4 h-4 text-yellow-400 shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <h2 className="text-sm font-bold text-blue-900 uppercase tracking-wide">Provisioned Models</h2>
          <span className="ml-auto text-xs text-blue-500">{rows.length} deployment{rows.length !== 1 ? 's' : ''}</span>
        </div>
        {foundryNames.map((fname, fi) => (
          <FoundryGroup key={fname} name={fname} models={grouped[fname]} defaultOpen={fi === 0} />
        ))}
      </div>

      {/* Right card — Model Consumption via APIM */}
      <div className="hidden md:flex md:w-2/5 min-w-0 bg-white border border-purple-100 rounded-2xl shadow-sm overflow-hidden flex-col">
        <ConsumptionPanel
          selectedSubscription={selectedSubscription}
          getAccessToken={getAccessToken}
        />
      </div>

    </div>
  );
}

function FoundryGroup({ name, models, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-blue-50 transition-colors text-left"
      >
        <svg className={`w-3.5 h-3.5 text-blue-400 transition-transform shrink-0 ${open ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
        </svg>
        <span className="text-xs font-semibold text-blue-800 flex-1 truncate">{name}</span>
        <span className="text-xs text-gray-400 shrink-0">{models.length} model{models.length !== 1 ? 's' : ''}</span>
      </button>
      {open && (
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 text-gray-400 uppercase tracking-wide">
              <th className="text-left px-6 py-1.5 font-semibold">Model</th>
              <th className="text-left px-3 py-1.5 font-semibold">Project</th>
              <th className="text-left px-3 py-1.5 font-semibold">Format</th>
              <th className="text-left px-3 py-1.5 font-semibold">SKU</th>
              <th className="text-right px-4 py-1.5 font-semibold">Capacity</th>
            </tr>
          </thead>
          <tbody>
            {models.map((m, i) => {
              const mi = m.properties?.model || {};
              return (
                <tr key={i} className="border-t border-gray-50 hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-2 font-medium text-blue-700">{mi.name || m.name}</td>
                  <td className="px-3 py-2 text-gray-400">{m._project || '—'}</td>
                  <td className="px-3 py-2 text-gray-500">{mi.format || '—'}</td>
                  <td className="px-3 py-2 text-gray-500">{m.sku?.name || '—'}</td>
                  <td className="px-4 py-2 text-right text-gray-500">{m.sku?.capacity != null ? m.sku.capacity.toLocaleString() : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function ModelHub({ foundries = [], selectedSubscription = '', getAccessToken = () => Promise.resolve(null) }) {
  const isAuthenticated = useIsAuthenticated();
  const [allModels, setAllModels] = useState([]);
  const deployedNames = buildDeployedNames(allModels);
  const provisionedCount = [...FIRST_PARTY, ...PARTNER, ...SELF_HOSTED]
    .filter(m => isProvisioned(m.matchKeys || [], deployedNames)).length;

  return (
    <div className="w-full max-w-full">

      {/* Page banner */}
      <div className="w-full bg-gradient-to-br from-blue-700 to-blue-500 rounded-2xl p-5 md:p-8 mb-6 shadow-lg text-white flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-1">Model Hub</h1>
          <p className="text-blue-100 text-sm md:text-base max-w-2xl">
            Explore AI models available through Azure AI Foundry — from Microsoft-built models and curated partner models to open-source and self-hosted options you can run in your own registry or on local hardware.
          </p>
        </div>
        <a
          href="https://ai.azure.com/explore/models"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 px-4 py-2 bg-white text-blue-700 rounded-xl text-sm font-semibold shadow hover:bg-blue-50 transition-colors"
        >
          Open Model Catalog ↗
        </a>
      </div>

      {/* Sign-in prompt when not authenticated */}
      {!isAuthenticated && (
        <div className="flex items-center gap-4 bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 mb-6">
          <svg className="w-8 h-8 text-blue-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
          </svg>
          <p className="text-sm font-semibold text-blue-900">
            Sign in and select a subscription &amp; foundry from the <a href="/inventory" className="text-yellow-500 hover:underline">Inventory</a> tab to see your provisioned models
          </p>
        </div>
      )}

      {/* Live provisioned models grid */}
      <FoundryModelsGrid
        foundries={foundries}
        selectedSubscription={selectedSubscription}
        getAccessToken={getAccessToken}
        onModelsLoaded={setAllModels}
      />

      {/* Star legend strip — only when models are loaded */}
      {allModels.length > 0 && provisionedCount > 0 && (
        <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-2.5 mb-5 text-xs text-yellow-800">
          <svg className="w-4 h-4 text-yellow-400 shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <span><strong>{provisionedCount}</strong> model{provisionedCount !== 1 ? 's' : ''} in the catalog below are starred — they match a deployment in your foundry.</span>
        </div>
      )}

      {/* Two-column layout: catalog sections left, benchmarks sticky right */}
      <div className="flex flex-col md:flex-row gap-4 items-start">

        {/* Left — all catalog sections + Foundry Local */}
        <div className="flex-1 min-w-0 flex flex-col">

          {/* Category 1 — Microsoft First-Party */}
          <CategorySection
            color="blue"
            icon={FIRST_PARTY_ICON}
            title="Microsoft First-Party Models"
            subtitle="Built and owned by Microsoft — Azure OpenAI (GPT, o-series) and the Phi small language model family"
            learnMoreUrl="https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models"
            models={FIRST_PARTY}
            borderClass="border-blue-200"
            bgClass="bg-blue-50"
            deployedNames={deployedNames}
          />

          {/* Category 2 — Microsoft Partner */}
          <CategorySection
            color="violet"
            icon={PARTNER_ICON}
            title="Microsoft Partner Models"
            subtitle="Models from Meta, Mistral, Cohere, AI21 and others — curated and hosted by Microsoft via Azure AI Foundry"
            learnMoreUrl="https://learn.microsoft.com/en-us/azure/ai-foundry/how-to/model-catalog-overview"
            models={PARTNER}
            borderClass="border-violet-200"
            bgClass="bg-violet-50"
            deployedNames={deployedNames}
          />

          {/* Category 3 — Third-Party / Self-Hosted */}
          <CategorySection
            color="teal"
            icon={SELF_HOSTED_ICON}
            title="Third-Party & Self-Hosted Models"
            subtitle="Open-source models from HuggingFace or the community — host in your Azure Model Registry or run on-device via Foundry Local"
            learnMoreUrl="https://learn.microsoft.com/en-us/azure/foundry-local/get-started"
            models={SELF_HOSTED}
            borderClass="border-teal-200"
            bgClass="bg-teal-50"
            deployedNames={deployedNames}
          />

          {/* Foundry Local explainer */}
          <div className="w-full bg-white border border-yellow-200 rounded-2xl p-4 md:p-6 shadow-sm mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-yellow-400 rounded-xl flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </div>
              <div>
                <h2 className="text-base font-bold text-yellow-800">Foundry Local — Run models on your own hardware</h2>
                <p className="text-xs text-yellow-600">No internet required · Data stays on-device · NPU/GPU/CPU support</p>
              </div>
            </div>
            <p className="text-sm text-gray-700 mb-3">
              <strong>Foundry Local</strong> lets you download and run AI models directly on Windows or Mac hardware — including NPU-accelerated inference on Copilot+ PCs. Models run in an OpenAI-compatible local server, so your existing agent code works without any changes.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3">
                <p className="font-semibold text-yellow-800 mb-1">1. Install Foundry Local</p>
                <code className="block bg-white border border-yellow-200 rounded px-2 py-1 text-gray-700 font-mono text-xs">winget install Microsoft.FoundryLocal</code>
              </div>
              <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3">
                <p className="font-semibold text-yellow-800 mb-1">2. Download a model</p>
                <code className="block bg-white border border-yellow-200 rounded px-2 py-1 text-gray-700 font-mono text-xs">foundry model run phi-3.8b</code>
              </div>
              <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3">
                <p className="font-semibold text-yellow-800 mb-1">3. Call via local endpoint</p>
                <code className="block bg-white border border-yellow-200 rounded px-2 py-1 text-gray-700 font-mono text-xs">http://localhost:5273/v1/chat/...</code>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Once tested locally, you can push the same model to your Azure AI Model Registry and scale it to the cloud.{' '}
              <a href="https://learn.microsoft.com/en-us/azure/foundry-local/get-started" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Learn more ↗</a>
            </p>
          </div>

        </div>

        {/* Right — Model Benchmarks, sticky so it stays in view while scrolling */}
        <div className="w-full md:w-72 lg:w-80 shrink-0 md:sticky md:top-4">
          <div className="bg-white border border-purple-100 rounded-2xl shadow-sm overflow-hidden">
            <BenchmarkLeaderboard />
          </div>
        </div>

      </div>

    </div>
  );
}
