import React, { useState } from 'react';
import { Card, CodeBlock, Pill, SectionTitle, Callout, Segmented, Sources } from './agents/ui';
import { ArchitectureDiagram, OnboardingSequenceDiagram, RequestFlowDiagram } from './gateway/GatewayDiagrams';
import { CLIENT_KEY, CLIENT_ENTRA, CLIENT_CURL, POLICY_XML } from './gateway/gatewaySamples';

const PLANES = [
  {
    title: 'Data plane',
    color: 'border-indigo-200 bg-indigo-50 text-indigo-950',
    body: 'Every runtime call from an app goes through one gateway URL. Policies authenticate the caller, enforce its token budget, screen the prompt, reuse cached answers, and route to the healthiest backend with the gateway\'s own managed identity — apps never hold Foundry keys.',
  },
  {
    title: 'Control plane',
    color: 'border-slate-200 bg-slate-50 text-slate-900',
    body: 'Setup and visibility: the catalog where teams discover models, the approval that creates a subscription and quota, the Entra app role that lets an app\'s identity call the gateway, and the metrics that show who used what.',
  },
  {
    title: 'Why not call Foundry directly?',
    color: 'border-amber-200 bg-amber-50 text-amber-950',
    body: 'Direct calls mean keys spread across apps, one noisy app can drain a shared TPM quota, and there\'s no single place to apply content safety, failover or chargeback. The gateway fixes all of these once, for every consumer.',
  },
];

const RECEIVES = [
  ['Endpoint', 'https://<apim>.azure-api.net/<api-path>'],
  ['Model names', 'deployment names exposed by the API'],
  ['Auth', 'Entra app role (preferred) or subscription key'],
  ['Budget', 'tokens-per-minute + monthly quota'],
  ['Secret home', 'Key Vault reference, never in code'],
  ['Visibility', 'usage in the AIHub Consumption panel'],
];

const ACCESS_PATTERNS = [
  { consumer: 'Web App (App Service)', auth: 'System-assigned managed identity → Entra token', note: 'No secret to store' },
  { consumer: 'AKS / ARO workload', auth: 'Workload ID → Entra token', note: 'Per-namespace service account' },
  { consumer: 'On-prem or other cloud', auth: 'Entra app (workload identity federation) or subscription key', note: 'Prefer federation over secrets' },
  { consumer: 'Partner / external', auth: 'Subscription key + OAuth via credential manager', note: 'Separate product with stricter quota' },
  { consumer: 'Copilot Studio / M365 agent', auth: 'Custom connector to the gateway', note: 'Govern like any other app' },
  { consumer: 'Foundry agent (BYO model)', auth: 'Foundry connection to the gateway', note: 'Agent traffic metered too' },
];

const FOUNDRY_INTEGRATION = [
  { title: 'Models', body: 'Enable the AI gateway on a Foundry resource and set TPM limits and token quotas per project, right in the Foundry portal.' },
  { title: 'Agents', body: 'Register agents running anywhere — Azure, other clouds, on-premises — into the Foundry control plane, then apply throttling or content safety.' },
  { title: 'Tools', body: 'Route MCP tool traffic through the gateway for authentication, rate limits, IP restrictions and audit logging; tools appear in the Foundry inventory.' },
];

const CLIENTS = [
  { id: 'entra', label: 'Python · Entra ID', file: 'app_entra.py', lang: 'python', code: CLIENT_ENTRA },
  { id: 'key', label: 'Python · subscription key', file: 'app_key.py', lang: 'python', code: CLIENT_KEY },
  { id: 'curl', label: 'curl', file: 'smoke-test.sh', lang: 'bash', code: CLIENT_CURL },
];

export default function AIGateway() {
  const [client, setClient] = useState('entra');
  const c = CLIENTS.find(x => x.id === client);

  return (
    <div className="w-full max-w-full flex flex-col gap-6">
      {/* Page banner */}
      <div className="w-full bg-gradient-to-br from-slate-800 to-indigo-600 rounded-2xl p-5 md:p-8 shadow-lg text-white flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-1">AI Gateway</h1>
          <p className="text-indigo-100 text-sm md:text-base max-w-3xl">
            One governed front door for every model, agent and tool. Apps hosted outside Foundry get their endpoint, identity and token budget here — and every call is authenticated, metered, screened and routed by Azure API Management.
          </p>
        </div>
        <a
          href="https://learn.microsoft.com/en-us/azure/api-management/genai-gateway-capabilities"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 px-4 py-2 bg-white text-indigo-700 rounded-xl text-sm font-semibold shadow hover:bg-indigo-50 transition-colors"
        >
          AI gateway docs ↗
        </a>
      </div>

      {/* 1. Big picture */}
      <Card>
        <SectionTitle
          title="The gateway in one picture"
          subtitle="Solid arrows are runtime traffic (data plane). Dashed arrows are setup and visibility (control plane)."
        />
        <ArchitectureDiagram />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5">
          {PLANES.map(p => (
            <div key={p.title} className={`border rounded-xl p-3 ${p.color}`}>
              <p className="text-sm font-bold mb-1">{p.title}</p>
              <p className="text-xs leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* 2. Onboarding */}
      <Card>
        <SectionTitle
          title="How a team gets an endpoint"
          subtitle="From browsing the catalog to the first governed call — the control plane in sequence."
        />
        <OnboardingSequenceDiagram />
        <p className="text-sm font-semibold text-gray-800 mt-5 mb-2">What the app team walks away with</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {RECEIVES.map(([k, v]) => (
            <div key={k} className="border border-gray-200 rounded-xl px-3 py-2 bg-gray-50">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{k}</p>
              <p className="text-sm text-gray-800 break-words">{v}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* 3. Runtime */}
      <Card>
        <SectionTitle
          title="What happens on every request"
          subtitle="Each gateway step can stop, answer or reroute the call before it reaches a model."
        />
        <RequestFlowDiagram />
        <div className="mt-5">
          <CodeBlock
            filename="policy.xml"
            lang="xml"
            code={POLICY_XML}
            note="Reference pattern using the AI gateway policies (llm-token-limit, llm-content-safety, llm-semantic-cache-*, llm-emit-token-metric). Validate attributes against your APIM tier."
          />
        </div>
      </Card>

      {/* 4. Consume */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <Card className="xl:col-span-3">
          <SectionTitle title="Consume from your app" subtitle="Point the standard OpenAI SDK at the gateway instead of Foundry." />
          <div className="mb-3"><Segmented options={CLIENTS} value={client} onChange={setClient} size="sm" /></div>
          <CodeBlock filename={c.file} lang={c.lang} code={c.code} />
          <div className="mt-3">
            <Callout kind="success" title="Prefer identity over keys">
              With Entra ID, an app on AKS or App Service authenticates with its own managed identity — nothing to rotate or leak. Keep subscription keys for partners and legacy clients, stored in Key Vault.
            </Callout>
          </div>
        </Card>

        <Card className="xl:col-span-2">
          <SectionTitle title="Access patterns" subtitle="How each kind of consumer authenticates" />
          <div className="flex flex-col gap-2">
            {ACCESS_PATTERNS.map(a => (
              <div key={a.consumer} className="border border-gray-200 rounded-xl px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-gray-900">{a.consumer}</p>
                  <Pill color="gray">{a.note}</Pill>
                </div>
                <p className="text-xs text-gray-600 mt-0.5">{a.auth}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 5. Foundry integration + this portal */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <SectionTitle title="AI gateway inside Foundry (preview)" subtitle="Enabled per Foundry resource; every project shares the gateway with its own limits." />
          <div className="flex flex-col gap-2">
            {FOUNDRY_INTEGRATION.map(f => (
              <div key={f.title} className="flex gap-3">
                <Pill color="indigo">{f.title}</Pill>
                <p className="text-sm text-gray-700">{f.body}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle title="How this portal uses the gateway today" subtitle="APIM instance AIGatewayAIDS" />
          <ol className="flex flex-col gap-1.5 text-sm text-gray-700 mb-3">
            {[
              'Apps call models through APIM; a token-limit policy enforces per-subscription quotas.',
              'An outbound policy reads prompt + completion tokens into the cache key usage|{subscriptionId}.',
              'The AIHub backend reads GET /internal/usage and the Consumption panel shows progress per model.',
            ].map((s, i) => (
              <li key={s} className="flex gap-2">
                <span className="w-5 h-5 shrink-0 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
          <Callout kind="idea" title="Next steps">
            Move from azure-openai-token-limit to the provider-neutral llm-token-limit, emit llm-emit-token-metric to Application Insights for durable usage history, and replace the APIM admin key used by the backend with an Entra-protected internal API.
          </Callout>
        </Card>
      </div>

      <Sources links={[
        { label: 'AI gateway capabilities in Azure API Management', url: 'https://learn.microsoft.com/en-us/azure/api-management/genai-gateway-capabilities' },
        { label: 'LLM token limit policy', url: 'https://learn.microsoft.com/en-us/azure/api-management/llm-token-limit-policy' },
        { label: 'Enforce content safety checks on LLM requests', url: 'https://learn.microsoft.com/en-us/azure/api-management/llm-content-safety-policy' },
        { label: 'Enable semantic caching for LLM APIs', url: 'https://learn.microsoft.com/en-us/azure/api-management/azure-openai-enable-semantic-caching' },
        { label: 'Emit token consumption metrics', url: 'https://learn.microsoft.com/en-us/azure/api-management/llm-emit-token-metric-policy' },
        { label: 'API Management backends — load balancing and circuit breaker', url: 'https://learn.microsoft.com/en-us/azure/api-management/backends' },
        { label: 'Authenticate and authorize access to LLM APIs', url: 'https://learn.microsoft.com/en-us/azure/api-management/api-management-authenticate-authorize-ai-apis' },
        { label: 'Configure AI Gateway in your Foundry resources', url: 'https://learn.microsoft.com/en-us/azure/foundry/configuration/enable-ai-api-management-gateway-portal' },
        { label: 'Enforce token limits for models (Foundry control plane)', url: 'https://learn.microsoft.com/en-us/azure/foundry/control-plane/how-to-enforce-limits-models' },
        { label: 'Govern MCP tools by using an AI gateway', url: 'https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/governance' },
        { label: 'AI gateway reference architecture using API Management', url: 'https://learn.microsoft.com/en-us/ai/playbook/technology-guidance/generative-ai/dev-starters/genai-gateway/reference-architectures/apim-based' },
      ]} />
    </div>
  );
}
