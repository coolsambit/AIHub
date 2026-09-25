import React from 'react';
import { Card, Pill, SectionTitle, Callout, Sources } from './ui';

const TYPES = [
  {
    id: 'prompt',
    name: 'Prompt agents',
    tagline: 'Configure, don\'t code',
    accent: 'border-blue-200 bg-blue-50',
    titleClass: 'text-blue-800',
    what: 'Defined entirely by instructions, a model and a set of tools in the Foundry portal (or declaratively in Copilot Studio / Agent Builder). No container, no code to run.',
    whoBuilds: 'Makers, analysts, app teams',
    runsOn: 'Foundry Agent Service (fully managed)',
    bestFor: ['Q&A and RAG over company knowledge', 'Assistants using built-in tools (Search, Code Interpreter, MCP, OpenAPI)', 'Fast prototypes and pilots'],
    limits: ['Limited to what prompt + tool configuration can express', 'No custom orchestration logic or custom protocols'],
    tags: [{ l: 'Low code', c: 'blue' }, { l: 'Managed', c: 'emerald' }],
  },
  {
    id: 'custom',
    name: 'Custom agents',
    tagline: 'Bring your own code',
    accent: 'border-violet-200 bg-violet-50',
    titleClass: 'text-violet-800',
    what: 'Your own agent code — Microsoft Agent Framework, LangChain / LangGraph, Semantic Kernel or custom — packaged as a container and exposed over the Responses or Invocations protocol.',
    whoBuilds: 'Engineering teams',
    runsOn: 'Foundry-hosted agents, or your own AKS / ARO / Web App',
    bestFor: ['Multi-step orchestration and workflows', 'Custom memory, state and business logic', 'Webhooks, batch jobs, voice, custom payloads'],
    limits: ['You own the code, tests and release pipeline', 'Self-hosting also means owning identity, scale and state'],
    tags: [{ l: 'Pro code', c: 'violet' }, { l: 'Foundry or self-hosted', c: 'indigo' }],
  },
  {
    id: 'third',
    name: 'Third-party agents',
    tagline: 'Plug and play',
    accent: 'border-amber-200 bg-amber-50',
    titleClass: 'text-amber-800',
    what: 'Agents built and operated by Microsoft or partners — installed from the Microsoft 365 agent store or connected over A2A / MCP. You configure access instead of building.',
    whoBuilds: 'Vendors; your admins onboard them',
    runsOn: 'The vendor\'s infrastructure',
    bestFor: ['Common business capabilities (CRM, ITSM, HR, sales)', 'Time to value over customisation', 'Agent-to-agent delegation via A2A'],
    limits: ['Data leaves your boundary — review retention and residency', 'Behaviour and updates controlled by the vendor'],
    tags: [{ l: 'No code', c: 'amber' }, { l: 'Vendor-managed', c: 'gray' }],
  },
];

const DECISION = [
  { q: 'Does an existing Microsoft or partner agent already do the job?', yes: 'Onboard a third-party agent', no: 'next question' },
  { q: 'Can instructions + built-in tools express the behaviour?', yes: 'Build a prompt agent', no: 'next question' },
  { q: 'Do you need custom orchestration, memory, protocols or frameworks?', yes: 'Build a custom agent', no: 'Start with a prompt agent' },
];

const ONBOARDING = [
  'Review the vendor\'s data handling, retention and region; confirm it fits your compliance boundary.',
  'Review requested permissions and consent scopes before approval.',
  'Register the agent in Azure API Center (A2A agent card) so developers can discover it.',
  'Publish from the Microsoft 365 admin center to a pilot group first, with a security template applied.',
  'Assign an owner and monitor risk signals in the agent registry.',
];

export default function AgentTypes() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <SectionTitle
          title="Three ways to get an agent"
          subtitle="Pick by how much control you need versus how much you want to operate yourself."
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {TYPES.map(t => (
            <div key={t.id} className={`border rounded-2xl p-4 flex flex-col gap-3 ${t.accent}`}>
              <div>
                <p className={`text-base font-bold ${t.titleClass}`}>{t.name}</p>
                <p className="text-xs font-semibold text-gray-500">{t.tagline}</p>
              </div>
              <div className="flex flex-wrap gap-1">{t.tags.map(g => <Pill key={g.l} color={g.c}>{g.l}</Pill>)}</div>
              <p className="text-sm text-gray-700 leading-relaxed">{t.what}</p>
              <dl className="text-xs grid grid-cols-[auto_1fr] gap-x-2 gap-y-1">
                <dt className="font-semibold text-gray-600">Built by</dt><dd className="text-gray-700">{t.whoBuilds}</dd>
                <dt className="font-semibold text-gray-600">Runs on</dt><dd className="text-gray-700">{t.runsOn}</dd>
              </dl>
              <div>
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Best for</p>
                <ul className="text-xs text-gray-700 list-disc pl-4 space-y-0.5">{t.bestFor.map(b => <li key={b}>{b}</li>)}</ul>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Watch out</p>
                <ul className="text-xs text-gray-700 list-disc pl-4 space-y-0.5">{t.limits.map(b => <li key={b}>{b}</li>)}</ul>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <SectionTitle title="Which one should I use?" subtitle="Walk the questions top to bottom." />
          <ol className="flex flex-col gap-3">
            {DECISION.map((d, i) => (
              <li key={d.q} className="flex gap-3">
                <span className="w-6 h-6 shrink-0 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">{i + 1}</span>
                <div className="text-sm">
                  <p className="font-semibold text-gray-800">{d.q}</p>
                  <p className="text-xs mt-1">
                    <span className="text-emerald-700 font-semibold">Yes →</span> <span className="text-gray-700">{d.yes}</span>
                    {d.no !== 'next question' && <><span className="mx-2 text-gray-300">|</span><span className="text-red-700 font-semibold">No →</span> <span className="text-gray-700">{d.no}</span></>}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-4">
            <Callout kind="idea" title="Start simple, graduate later">
              Many teams prototype as a prompt agent, then rebuild as a custom agent when they hit the limits of configuration. Both run in the same Foundry project and share models, tools and identity controls.
            </Callout>
          </div>
        </Card>

        <Card>
          <SectionTitle title="Onboarding a third-party agent" subtitle="Plug and play still needs a gate." />
          <ol className="flex flex-col gap-2">
            {ONBOARDING.map((s, i) => (
              <li key={s} className="flex gap-3 text-sm text-gray-700">
                <span className="w-6 h-6 shrink-0 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">{i + 1}</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
          <div className="mt-4">
            <Callout kind="warn" title="Third-party systems are your responsibility">
              Microsoft's guidance is that using third-party agents, tools or MCP servers is at your own risk: review what data is shared with them and whether it leaves your compliance and geographic boundaries.
            </Callout>
          </div>
        </Card>
      </div>

      <Sources links={[
        { label: 'Hosted agents in Foundry Agent Service', url: 'https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/hosted-agents' },
        { label: 'Agent Registry in Microsoft 365 admin center', url: 'https://learn.microsoft.com/en-us/microsoft-365/admin/manage/agent-registry?view=o365-worldwide' },
        { label: 'Register and manage agents in Azure API Center', url: 'https://learn.microsoft.com/en-us/azure/api-center/register-manage-agents' },
      ]} />
    </div>
  );
}
