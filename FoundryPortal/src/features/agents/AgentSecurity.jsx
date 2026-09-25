import React from 'react';
import { Card, Pill, SectionTitle, Callout, Sources } from './ui';

const ACCESS_PATTERNS = [
  {
    name: 'On behalf of a user',
    flow: 'OAuth 2.0 on-behalf-of (delegated)',
    subject: 'The user (agent identified as the caller)',
    ca: 'Target users and groups',
    example: 'Agent reads your mailbox with your permissions',
    color: 'border-blue-200 bg-blue-50',
  },
  {
    name: 'As itself (autonomous)',
    flow: 'Client credentials (app-only)',
    subject: 'The agent identity',
    ca: 'Target agent identities or their blueprint',
    example: 'Nightly report agent, event-driven agent',
    color: 'border-violet-200 bg-violet-50',
  },
  {
    name: 'As a user account',
    flow: 'Agent user flow',
    subject: 'The agent\'s own user account',
    ca: 'Target the agent\'s user account',
    example: 'Digital worker with its own mailbox and Teams chat',
    color: 'border-amber-200 bg-amber-50',
  },
];

const ENTRA_CONCEPTS = [
  { term: 'Agent identity', desc: 'A purpose-built Entra identity for one agent. Foundry creates one automatically for each hosted agent at deploy time and uses it for model, tool and downstream calls.' },
  { term: 'Agent identity blueprint', desc: 'The template agent identities are created from. Apply Conditional Access at the blueprint to cover every agent derived from it — including future ones.' },
  { term: 'Project managed identity', desc: 'The Foundry project\'s system identity, used by the platform (e.g. pulling images from ACR). It is not the agent\'s runtime identity.' },
  { term: 'Custom security attributes', desc: 'Label agents and resources (e.g. data classification) and target the labels in Conditional Access so policy scales with the number of agents.' },
  { term: 'Third-party & self-hosted', desc: 'Agents built elsewhere (including AKS or AWS Bedrock) can get a governed Entra identity through the Microsoft Entra ID Auth SDK sidecar or workload identity federation.' },
];

// Threat → control map for agentic AI.
const THREATS = [
  {
    threat: 'Direct prompt injection / jailbreak',
    example: 'User tells the agent to ignore its rules and reveal data.',
    controls: ['Prompt Shields / content-safety guardrail on the agent', 'Strong system instructions', 'Red-team before release'],
    where: ['Foundry guardrails', 'Content Safety'],
  },
  {
    threat: 'Indirect prompt injection',
    example: 'A document, web page or MCP tool response carries hidden instructions.',
    controls: ['Run Prompt Shields on tool outputs and retrieved content', 'Treat tool output as data, never as instructions', 'Vet and pin MCP servers'],
    where: ['Content Safety', 'API Center'],
  },
  {
    threat: 'Excessive agency / tool misuse',
    example: 'Agent deletes records or sends mail it shouldn\'t.',
    controls: ['approval_mode="always_require" on write tools', 'Human-in-the-loop interrupts', 'Least-privilege RBAC for the agent identity'],
    where: ['Agent Framework', 'Entra / RBAC'],
  },
  {
    threat: 'Over-privileged or rogue identity',
    example: 'Agent identity holds broad rights or is used from an unexpected context.',
    controls: ['One identity per agent, scoped roles', 'Conditional Access at blueprint level', 'Block high-risk agents with Identity Protection'],
    where: ['Entra Agent ID', 'Conditional Access'],
  },
  {
    threat: 'Data exfiltration',
    example: 'Sensitive data sent to a third-party tool or model.',
    controls: ['Purview DLP on tool-call parameters', 'Private networking / VNet egress', 'Review third-party data residency'],
    where: ['Purview', 'VNet'],
  },
  {
    threat: 'Secret leakage',
    example: 'API keys baked into images or environment variables.',
    controls: ['Managed identity / Workload ID instead of keys', 'Foundry connections or Key Vault for secrets', 'No secrets in images'],
    where: ['Key Vault', 'Foundry connections'],
  },
  {
    threat: 'Shadow and ownerless agents',
    example: 'Agents nobody owns keep running with old permissions.',
    controls: ['Register every agent in API Center', 'Review "Agents without owners" and "Unmanaged agents"', 'Block or delete'],
    where: ['M365 registry', 'API Center'],
  },
  {
    threat: 'Undetected runtime attacks',
    example: 'Suspicious prompts or tool calls go unnoticed.',
    controls: ['Defender for Cloud AI threat protection alerts', 'Risk signals in the agent registry', 'OpenTelemetry traces + audit history'],
    where: ['Defender', 'App Insights'],
  },
];

const CHECKLIST = [
  'Every agent has its own identity and a named owner',
  'Agent identities hold only the roles their tools need',
  'Conditional Access policy applied at the agent identity blueprint',
  'Write / destructive tools require human approval',
  'Prompt Shields on user input and on tool / retrieval output',
  'No secrets in images or environment variables',
  'Traces flow to Application Insights; retention reviewed for personal data',
  'Agent registered in API Center and published to a pilot group first',
];

export default function AgentSecurity() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <SectionTitle
          title="Microsoft Entra integration"
          subtitle="Agents are identities. Entra Agent ID gives them the same identity controls as users and workloads: adaptive access, risk detection, lifecycle and audit."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mb-5">
          {ENTRA_CONCEPTS.map(c => (
            <div key={c.term} className="border border-gray-200 rounded-xl p-3 bg-gray-50">
              <p className="text-sm font-bold text-gray-900 mb-1">{c.term}</p>
              <p className="text-xs text-gray-600 leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>

        <p className="text-sm font-semibold text-gray-800 mb-2">Three ways an agent gets a token — and where Conditional Access applies</p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {ACCESS_PATTERNS.map(p => (
            <div key={p.name} className={`border rounded-xl p-3 ${p.color}`}>
              <p className="text-sm font-bold text-gray-900 mb-2">{p.name}</p>
              <dl className="text-xs grid grid-cols-[auto_1fr] gap-x-2 gap-y-1">
                <dt className="font-semibold text-gray-600">Flow</dt><dd className="text-gray-800">{p.flow}</dd>
                <dt className="font-semibold text-gray-600">Token subject</dt><dd className="text-gray-800">{p.subject}</dd>
                <dt className="font-semibold text-gray-600">CA targets</dt><dd className="text-gray-800">{p.ca}</dd>
                <dt className="font-semibold text-gray-600">Example</dt><dd className="text-gray-800">{p.example}</dd>
              </dl>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-4">
          <Callout kind="warn" title="Conditional Access only covers Entra-issued tokens">
            If an agent calls a resource with an API key, it bypasses Entra token issuance and Conditional Access doesn't apply. Prefer managed identity and Entra-protected APIs everywhere.
          </Callout>
          <Callout kind="info" title="Licensing">
            Agent ID is available to all Entra customers. Conditional Access for agents needs Entra ID P1/P2 plus a Microsoft Agent 365 licence per user (included in Microsoft 365 E7, add-on for E5/A5/Business Premium).
          </Callout>
        </div>
      </Card>

      <Card>
        <SectionTitle
          title="Agentic AI security"
          subtitle="Agents don't just read — they act. Map each threat to a control and to the product that enforces it."
        />
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-gray-500 uppercase tracking-wide border-b border-gray-200">
                <th className="py-2 pr-3 font-semibold">Threat</th>
                <th className="py-2 pr-3 font-semibold">Controls</th>
                <th className="py-2 font-semibold">Enforced by</th>
              </tr>
            </thead>
            <tbody>
              {THREATS.map(t => (
                <tr key={t.threat} className="border-b border-gray-100 align-top">
                  <td className="py-2.5 pr-3 min-w-[12rem]">
                    <p className="font-semibold text-gray-900">{t.threat}</p>
                    <p className="text-gray-500 mt-0.5">{t.example}</p>
                  </td>
                  <td className="py-2.5 pr-3">
                    <ul className="list-disc pl-4 space-y-0.5 text-gray-700">{t.controls.map(c => <li key={c}>{c}</li>)}</ul>
                  </td>
                  <td className="py-2.5">
                    <div className="flex flex-wrap gap-1">{t.where.map(w => <Pill key={w} color="indigo">{w}</Pill>)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <SectionTitle title="Security by hosting model" />
          <div className="flex flex-col gap-3 text-sm">
            <div className="border border-indigo-200 bg-indigo-50 rounded-xl p-3 text-indigo-950">
              <p className="font-bold mb-1">Foundry-hosted</p>
              <p className="text-xs leading-relaxed">Per-session VM-isolated sandboxes, an Entra agent identity per agent, Entra-authenticated endpoint, content-safety guardrail on the version, secrets resolved from project connections, VNet egress for network-isolated projects. For user-invoked Teams / Microsoft 365 calls the agent can use OBO; otherwise it uses its own identity.</p>
            </div>
            <div className="border border-teal-200 bg-teal-50 rounded-xl p-3 text-teal-950">
              <p className="font-bold mb-1">Self-hosted (AKS / ARO / Web App)</p>
              <p className="text-xs leading-relaxed">You provide isolation (namespaces, network policies), inbound auth (App Service Authentication, ingress + Entra, API Management), managed identity or Workload ID, content safety calls and telemetry. Use the Entra Auth SDK sidecar or workload identity federation to give the agent a governed Entra Agent ID.</p>
            </div>
          </div>
        </Card>

        <Card>
          <SectionTitle title="Release checklist" subtitle="Before an agent leaves the pilot group" />
          <ul className="flex flex-col gap-2">
            {CHECKLIST.map(c => (
              <li key={c} className="flex gap-2 text-sm text-gray-700">
                <span className="w-5 h-5 shrink-0 rounded border-2 border-indigo-300 mt-0.5" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Sources links={[
        { label: 'What is Microsoft Entra Agent ID?', url: 'https://learn.microsoft.com/en-us/entra/agent-id/what-is-microsoft-entra-agent-id' },
        { label: 'Conditional Access for agents', url: 'https://learn.microsoft.com/en-us/entra/identity/conditional-access/agent-id' },
        { label: 'Agent identity blueprints', url: 'https://learn.microsoft.com/en-us/entra/agent-id/agent-blueprint' },
        { label: 'Hosted agents — identity and security', url: 'https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/hosted-agents' },
        { label: 'Securing AI agents: when AI tools move from reading to acting', url: 'https://www.microsoft.com/en-us/security/blog/2026/06/30/securing-ai-agents-ai-tools-move-from-reading-acting/' },
        { label: 'Defend against indirect prompt injection attacks', url: 'https://learn.microsoft.com/en-us/security/zero-trust/sfi/defend-indirect-prompt-injection' },
        { label: 'Alerts for AI agents — Defender for Cloud', url: 'https://learn.microsoft.com/en-us/azure/defender-for-cloud/alerts-ai-workloads#alerts-for-ai-agents' },
      ]} />
    </div>
  );
}
