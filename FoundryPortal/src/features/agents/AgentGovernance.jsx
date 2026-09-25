import React from 'react';
import { Card, CodeBlock, Pill, SectionTitle, Callout, Sources } from './ui';
import { GRAPH_LIST_AGENTS } from './codeSamples';

const LIFECYCLE = [
  { n: 1, title: 'Build',    where: 'Foundry / your repo',         desc: 'Prompt agent in Foundry, or custom agent code hosted in Foundry or self-hosted.', color: 'bg-violet-600' },
  { n: 2, title: 'Register', where: 'Azure API Center',            desc: 'Catalogue the agent for developers: definition, A2A agent card, versions, lifecycle, AI assessment.', color: 'bg-blue-600' },
  { n: 3, title: 'Publish',  where: 'Microsoft 365 admin center',  desc: 'Make it available to users and groups in Copilot, Teams, Outlook and SharePoint with a security template.', color: 'bg-indigo-600' },
  { n: 4, title: 'Operate',  where: 'Agent registry',              desc: 'Owners, risk signals, pinning, blocking, exports and Microsoft Graph automation.', color: 'bg-emerald-600' },
];

const REGISTRY_TYPES = [
  { type: 'Microsoft agents',              desc: 'Built and maintained by Microsoft.' },
  { type: 'External partner-built agents', desc: 'Built by trusted non-Microsoft developers for broader availability — your plug-and-play agents.' },
  { type: 'Published by your org',         desc: 'Custom line-of-business agents your organisation approved and published.' },
  { type: 'Shared by creator',             desc: 'Agents created and shared by individual users.' },
];

const UPLOAD_STEPS = [
  'Agents → All agents → Add agent, then choose the agent ZIP (manifest, config, icons, knowledge).',
  'Verify the agent\'s name, icon and host products.',
  'Publish: select the users or groups who can install it.',
  'Deploy (optional): select users or groups who get it preinstalled — start with a test group.',
  'Apply a security policy template, a custom policy or the default policy.',
  'Review the agent\'s permissions.',
  'Finish deployment.',
];

const PATHS_TO_M365 = [
  { from: 'Foundry hosted agent', how: 'Publish to Teams / Microsoft 365 from Foundry — the Responses protocol is bridged to the Activity protocol automatically.' },
  { from: 'Copilot Studio / Agent Builder', how: 'Download the agent .zip and upload it with Add agent in the admin center.' },
  { from: 'Self-hosted custom agent', how: 'Front it with the Microsoft 365 Agents SDK / bot registration, build an app package, then upload the .zip.' },
  { from: 'Third-party agent', how: 'Appears as External partner-built; review, then publish or block.' },
];

const API_CENTER_FIELDS = [
  ['Title / identification', 'Name and generated ID, e.g. help-desk-agent'],
  ['Summary / description', 'What the agent does and its use cases'],
  ['Version + lifecycle', 'e.g. v1 in Development, Preview, Production'],
  ['Agent definition', 'Markdown describing capabilities and skills'],
  ['Protocol', 'Select A2A if the agent follows the A2A spec'],
  ['Agent card', 'A2A agent card JSON (URL or file)'],
];

export default function AgentGovernance() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <SectionTitle title="Agent lifecycle" subtitle="Two registries, two audiences: API Center is the developer catalogue; the Microsoft 365 registry is where users get agents and admins govern them." />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {LIFECYCLE.map(s => (
            <div key={s.n} className="border border-gray-200 rounded-xl p-3 bg-gray-50 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className={`w-7 h-7 rounded-full text-white text-sm font-bold flex items-center justify-center ${s.color}`}>{s.n}</span>
                <span className="text-base font-bold text-gray-900">{s.title}</span>
              </div>
              <Pill color="gray">{s.where}</Pill>
              <p className="text-xs text-gray-700 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <SectionTitle title="Azure API Center — developer catalogue" subtitle="Inventory → Assets → + Register an asset → Agent" />
          <table className="w-full text-xs mb-4">
            <tbody>
              {API_CENTER_FIELDS.map(([k, v]) => (
                <tr key={k} className="border-b border-gray-100 align-top">
                  <td className="py-1.5 pr-3 font-semibold text-gray-800 whitespace-nowrap">{k}</td>
                  <td className="py-1.5 text-gray-600">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex flex-col gap-2 text-sm text-gray-700">
            <p><span className="font-semibold">Keep it in sync:</span> synchronise A2A agents from Azure API Management or a Git repository instead of registering by hand.</p>
            <p><span className="font-semibold">Discover:</span> the API Center portal lets developers browse, filter and inspect agents.</p>
            <p><span className="font-semibold">Assess:</span> Governance → AI Assessment scores agents against default or custom criteria, with weights and pass thresholds — a quality gate before publishing.</p>
          </div>
        </Card>

        <Card>
          <SectionTitle title="Microsoft 365 admin center — agent registry" subtitle="Agents → All agents → Registry" />
          <div className="flex flex-col gap-2 mb-4">
            {REGISTRY_TYPES.map(r => (
              <div key={r.type} className="flex gap-3 text-xs">
                <span className="font-semibold text-gray-800 w-44 shrink-0">{r.type}</span>
                <span className="text-gray-600">{r.desc}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[['Total agents', 'Everything available in the tenant'], ['Agents without owners', 'Creator left — block or delete'], ['Unmanaged agents', 'Outside Agent 365 protection']].map(([t, d]) => (
              <div key={t} className="bg-indigo-50 border border-indigo-100 rounded-xl p-2">
                <p className="text-xs font-bold text-indigo-900">{t}</p>
                <p className="text-[11px] text-indigo-700">{d}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-600">Filter by status, publisher type, channel (Copilot, Teams, Outlook, Microsoft 365 apps, SharePoint), platform and data source. Export to CSV with 30+ fields per agent.</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <SectionTitle title="Hooking an agent into Microsoft 365" subtitle="How each kind of agent reaches users" />
          <div className="flex flex-col gap-2 mb-4">
            {PATHS_TO_M365.map(p => (
              <div key={p.from} className="border border-gray-200 rounded-xl p-3">
                <p className="text-sm font-semibold text-gray-900">{p.from}</p>
                <p className="text-xs text-gray-600 mt-0.5">{p.how}</p>
              </div>
            ))}
          </div>
          <p className="text-sm font-semibold text-gray-800 mb-2">Upload a custom agent</p>
          <ol className="flex flex-col gap-1.5">
            {UPLOAD_STEPS.map((s, i) => (
              <li key={s} className="flex gap-2 text-xs text-gray-700">
                <span className="w-5 h-5 shrink-0 rounded-full bg-indigo-100 text-indigo-800 font-bold flex items-center justify-center">{i + 1}</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </Card>

        <Card>
          <SectionTitle title="Operate at scale" subtitle="Pinning, risk and automation" />
          <div className="flex flex-col gap-3 text-sm text-gray-700 mb-4">
            <p><span className="font-semibold">Pinning:</span> admins with the AI Administrator role can pin up to three deployed agents for all users or specific groups; users can't unpin them. Changes can take up to six hours to appear.</p>
            <p><span className="font-semibold">Risk signals:</span> the Risks column aggregates high / medium / low detections from Microsoft Purview, Entra and Defender per agent, with deep links to each portal. Requires an E7 or Agent 365 licence.</p>
            <p><span className="font-semibold">Automation:</span> the Microsoft Graph package APIs (preview) list and inspect every agent for reporting and bulk governance.</p>
          </div>
          <CodeBlock filename="list-agents.ps1" lang="powershell" code={GRAPH_LIST_AGENTS} note="Microsoft sample — requires CopilotPackages.Read.All and the AI Administrator role." />
        </Card>
      </div>

      <Callout kind="info" title="Suggested operating model">
        Register every agent — prompt, custom and third-party — in API Center first so there is one catalogue with owners and assessments. Only agents that pass assessment get published through the Microsoft 365 admin center, to a pilot group first, with a security template applied.
      </Callout>

      <Sources links={[
        { label: 'Register and manage agents in Azure API Center', url: 'https://learn.microsoft.com/en-us/azure/api-center/register-manage-agents' },
        { label: 'Agent Registry in Microsoft 365 admin center', url: 'https://learn.microsoft.com/en-us/microsoft-365/admin/manage/agent-registry?view=o365-worldwide' },
        { label: 'Hosted agents — publishing to Teams and Microsoft 365', url: 'https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/hosted-agents' },
      ]} />
    </div>
  );
}
