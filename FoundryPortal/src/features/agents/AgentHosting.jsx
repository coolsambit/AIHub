import React, { useState } from 'react';
import { Card, CodeBlock, Pill, SectionTitle, Callout, ProsCons, Segmented, Sources } from './ui';
import {
  HOST_AF_REQUIREMENTS, HOST_AF_MAIN, HOST_LG_REQUIREMENTS, HOST_LG_MAIN,
  DOCKERFILE, DOCKER_BUILD, DEPLOY_FOUNDRY, DEPLOY_AKS_SETUP, DEPLOY_AKS_MANIFEST,
  DEPLOY_WEBAPP, INVOKE_RESPONSES,
} from './codeSamples';

const RESPONSIBILITIES = [
  { concern: 'Endpoint & inbound auth',   foundry: 'Dedicated agent endpoint, Entra-authenticated',                 self: 'Ingress / App Service auth / API Management you configure' },
  { concern: 'Runtime identity',          foundry: 'Entra agent identity created per agent at deploy',             self: 'Managed identity or AKS Workload ID you create and scope' },
  { concern: 'Conversation & state',      foundry: 'Platform conversations, persisted $HOME, durable state store', self: 'Your store: Cosmos DB, Redis, Postgres checkpointer…' },
  { concern: 'Scaling',                   foundry: 'Per-session VM-isolated sandbox, scale to zero',               self: 'HPA / KEDA on AKS, scale-out rules on App Service' },
  { concern: 'Observability',             foundry: 'App Insights + OpenTelemetry injected automatically',           self: 'Wire OpenTelemetry and App Insights yourself' },
  { concern: 'Guardrails',                foundry: 'Content-safety guardrail on the agent version',                self: 'Call Content Safety / Prompt Shields from your code or gateway' },
  { concern: 'Microsoft 365 / Teams',     foundry: 'Publish; Responses bridged to Activity protocol',              self: 'Microsoft 365 Agents SDK / bot registration + app package' },
  { concern: 'Compute',                   foundry: 'Up to 2 vCPU / 4 GiB per session',                              self: 'Any size, GPUs, sidecars, co-located self-hosted models' },
  { concern: 'Rollout',                   foundry: 'Immutable versions, 100% traffic to one version',               self: 'Canary / blue-green / traffic splitting as you like' },
];

const FOUNDRY_PROS = [
  'Entra agent identity and dedicated endpoint created automatically',
  'Sessions, conversation history and files persisted for you; scale to zero with stateful resume',
  'Per-session VM isolation',
  'Tracing to Application Insights out of the box',
  'Toolbox MCP endpoint for Foundry tools with consolidated auth',
  'Direct path to publish into Teams and Microsoft 365',
];
const FOUNDRY_CONS = [
  'Sandbox capped at 2 vCPU / 4 GiB per session',
  'No traffic splitting between versions',
  'Python and C# only; limited to supported regions',
  'Billed on CPU + memory across all active sessions — oversizing multiplies cost',
  'Private container registry only for projects created after June 25, 2026',
];
const SELF_PROS = [
  'Full control of compute, networking, sidecars and GPUs',
  'Fits existing AKS / ARO / App Service platforms, pipelines and policies',
  'Any language or framework; canary and blue-green rollouts',
  'Can sit next to self-hosted models and private data',
  'Predictable cost with reserved capacity',
];
const SELF_CONS = [
  'You build identity, auth, session state, scaling and patching',
  'Guardrails and content safety are custom work',
  'Microsoft 365 / Teams publishing needs extra plumbing',
  'In-memory memory breaks once you scale past one replica',
  'More operational surface to secure and audit',
];

const FRAMEWORKS = [
  { id: 'af', label: 'Agent Framework' },
  { id: 'lg', label: 'LangChain / LangGraph' },
];
const TARGETS = [
  { id: 'foundry', label: 'Foundry-hosted' },
  { id: 'aks', label: 'AKS' },
  { id: 'webapp', label: 'Web App' },
];

const TARGET_NOTES = {
  foundry: {
    kind: 'success',
    title: 'Foundry injects configuration',
    body: 'FOUNDRY_PROJECT_ENDPOINT, the model deployment name and APPLICATIONINSIGHTS_CONNECTION_STRING are injected at runtime. You need the Foundry Project Manager role to deploy. azd builds the image in ACR, creates an agent version and assigns the agent identity its roles.',
  },
  aks: {
    kind: 'info',
    title: 'Same image, you provide the platform',
    body: 'Set the endpoint and model yourself, run the pod under Workload Identity so DefaultAzureCredential gets a token without secrets, and put an authenticated ingress or API Management in front. Keep replicas at 1 until conversation state and memory live in an external store.',
  },
  webapp: {
    kind: 'info',
    title: 'Simplest self-hosted option',
    body: 'App Service runs the container with a system-assigned managed identity. Set WEBSITES_PORT=8088 and turn on App Service Authentication. Microsoft\'s LangGraph + App Service tutorial uses the same pattern with azd up.',
  },
};

function HostingBuilder() {
  const [fw, setFw] = useState('af');
  const [target, setTarget] = useState('foundry');
  const note = TARGET_NOTES[target];

  return (
    <Card>
      <SectionTitle
        title="Build once, deploy anywhere"
        subtitle="Both frameworks ship a Foundry protocol host that serves POST /responses on port 8088. The same container runs in Foundry or on your own infrastructure."
      />
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center mb-4">
        <div className="flex items-center gap-2"><span className="text-xs font-semibold text-gray-500 w-20">Framework</span><Segmented options={FRAMEWORKS} value={fw} onChange={setFw} size="sm" /></div>
        <div className="flex items-center gap-2"><span className="text-xs font-semibold text-gray-500 w-20 sm:w-auto">Target</span><Segmented options={TARGETS} value={target} onChange={setTarget} size="sm" /></div>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <p className="text-sm font-semibold text-gray-800 mb-2">1 · Agent code</p>
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_2fr] gap-3">
            <CodeBlock filename="requirements.txt" lang="text" code={fw === 'af' ? HOST_AF_REQUIREMENTS : HOST_LG_REQUIREMENTS} />
            <CodeBlock
              filename="main.py"
              code={fw === 'af' ? HOST_AF_MAIN : HOST_LG_MAIN}
              note={fw === 'af' ? 'Microsoft sample — agent_framework_foundry_hosting.ResponsesHostServer' : 'Microsoft sample — langchain_azure_ai.agents.hosting.ResponsesHostServer (checkpointer added)'}
            />
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-800 mb-2">2 · Container</p>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            <CodeBlock filename="Dockerfile" lang="docker" code={DOCKERFILE} />
            <CodeBlock filename="build-and-push.sh" lang="bash" code={DOCKER_BUILD} note={target === 'foundry' ? 'Optional for Foundry — azd deploy builds the image remotely in ACR.' : 'Hosting platforms require linux/amd64 images.'} />
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-800 mb-2">3 · Deploy to {TARGETS.find(t => t.id === target).label}</p>
          <div className="flex flex-col gap-3">
            {target === 'foundry' && <CodeBlock filename="deploy.sh" lang="bash" code={DEPLOY_FOUNDRY} note="Microsoft docs — azd ai agent extension" />}
            {target === 'aks' && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                <CodeBlock filename="aks-identity.sh" lang="bash" code={DEPLOY_AKS_SETUP} />
                <CodeBlock filename="k8s/memory-agent.yaml" lang="yaml" code={DEPLOY_AKS_MANIFEST} />
              </div>
            )}
            {target === 'webapp' && <CodeBlock filename="webapp.sh" lang="bash" code={DEPLOY_WEBAPP} />}
            <Callout kind={note.kind} title={note.title}>{note.body}</Callout>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-800 mb-2">4 · Test</p>
          <CodeBlock filename="test.sh" lang="bash" code={INVOKE_RESPONSES} note="Locally or through your ingress. In Foundry, call {project_endpoint}/agents/{name}/endpoint/protocols/openai/responses with an Entra token." />
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-4">
        Dockerfile, AKS and Web App snippets are reference patterns assembled for this portal, not official Microsoft samples. Validate role names and flags against your tenant before use.
      </p>
    </Card>
  );
}

export default function AgentHosting() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <SectionTitle
          title="Where does a custom agent run?"
          subtitle="A custom agent is a container. You choose whether Microsoft operates it in Foundry or your organisation operates it on its own platform."
        />
        {/* Flow: code → container → two homes */}
        <div className="flex flex-col lg:flex-row items-stretch gap-3">
          <div className="flex-1 border border-gray-200 rounded-xl p-3 bg-gray-50">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Your code</p>
            <p className="text-sm text-gray-800">Agent Framework, LangChain / LangGraph, Semantic Kernel or custom</p>
          </div>
          <div className="hidden lg:flex items-center text-gray-300 text-xl">→</div>
          <div className="flex-1 border border-gray-200 rounded-xl p-3 bg-gray-50">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Container image</p>
            <p className="text-sm text-gray-800">Protocol host on :8088 — <code className="text-xs">/responses</code>, <code className="text-xs">/invocations</code>, <code className="text-xs">/readiness</code></p>
          </div>
          <div className="hidden lg:flex items-center text-gray-300 text-xl">→</div>
          <div className="flex-[1.4] grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="border border-indigo-200 rounded-xl p-3 bg-indigo-50">
              <p className="text-xs font-bold text-indigo-700 uppercase tracking-wide mb-1">Foundry-hosted</p>
              <p className="text-sm text-indigo-900">Microsoft runs it: identity, sessions, scale, telemetry included</p>
            </div>
            <div className="border border-teal-200 rounded-xl p-3 bg-teal-50">
              <p className="text-xs font-bold text-teal-700 uppercase tracking-wide mb-1">Self-hosted</p>
              <p className="text-sm text-teal-900">Your AKS, ARO or Web App: you run the platform around it</p>
              <div className="flex flex-wrap gap-1 mt-2"><Pill color="sky">AKS</Pill><Pill color="red">ARO</Pill><Pill color="indigo">Web App</Pill></div>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <SectionTitle title="Who owns what" subtitle="The trade-off in one table." />
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-gray-500 uppercase tracking-wide border-b border-gray-200">
                <th className="py-2 pr-3 font-semibold">Concern</th>
                <th className="py-2 pr-3 font-semibold text-indigo-700">Foundry-hosted (platform)</th>
                <th className="py-2 font-semibold text-teal-700">Self-hosted (you)</th>
              </tr>
            </thead>
            <tbody>
              {RESPONSIBILITIES.map(r => (
                <tr key={r.concern} className="border-b border-gray-100 align-top">
                  <td className="py-2 pr-3 font-semibold text-gray-800 whitespace-nowrap">{r.concern}</td>
                  <td className="py-2 pr-3 text-gray-700">{r.foundry}</td>
                  <td className="py-2 text-gray-700">{r.self}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <SectionTitle title="Foundry-hosted" subtitle="Managed runtime for your container" />
          <ProsCons pros={FOUNDRY_PROS} cons={FOUNDRY_CONS} />
        </Card>
        <Card>
          <SectionTitle title="Self-hosted (AKS / ARO / Web App)" subtitle="Your platform, your rules" />
          <ProsCons pros={SELF_PROS} cons={SELF_CONS} />
        </Card>
      </div>

      <HostingBuilder />

      <Sources links={[
        { label: 'Hosted agents in Foundry Agent Service', url: 'https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/hosted-agents' },
        { label: 'Deploy a hosted agent', url: 'https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/deploy-hosted-agent' },
        { label: 'Host Agent Framework agents as Foundry hosted agents', url: 'https://learn.microsoft.com/en-us/azure/foundry/how-to/develop/framework-hosted-agents' },
        { label: 'Host LangGraph agents as Foundry hosted agents', url: 'https://learn.microsoft.com/en-us/azure/foundry/how-to/develop/langchain-hosted-agents' },
        { label: 'Agentic app with LangGraph or Foundry Agent Service on App Service', url: 'https://learn.microsoft.com/en-us/azure/app-service/tutorial-ai-agent-web-app-langgraph-foundry-python' },
        { label: 'AKS Workload ID overview', url: 'https://learn.microsoft.com/en-us/azure/aks/workload-identity-overview' },
      ]} />
    </div>
  );
}
