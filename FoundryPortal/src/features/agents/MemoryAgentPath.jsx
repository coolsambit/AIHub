import React, { useState } from 'react';
import { Card, CodeBlock, Pill, Callout, Sources } from './ui';
import {
  STEP1_INSTALL, STEP1_FIRST_AGENT, STEP2_TOOLS, STEP3_MULTI_TURN, STEP4_PROVIDER,
  STEP4_RUN, STEP4_LAYERED, STEP5_WORKFLOW, STEP6_HARNESS, MEMORY_AGENT_ASSEMBLED,
} from './codeSamples';

const DOCS = 'https://learn.microsoft.com/en-us/agent-framework/get-started';

// Memory layers the use case builds up, shown on the overview step.
const MEMORY_LAYERS = [
  { name: 'Instructions',         where: 'Agent definition',          lifetime: 'Every run',             step: 1, color: 'bg-slate-100 border-slate-300 text-slate-800' },
  { name: 'Conversation history', where: 'AgentSession',              lifetime: 'One conversation',      step: 3, color: 'bg-blue-50 border-blue-200 text-blue-900' },
  { name: 'User facts',           where: 'ContextProvider + state',   lifetime: 'Across turns',          step: 4, color: 'bg-violet-50 border-violet-200 text-violet-900' },
  { name: 'Long-term memory',     where: 'Mem0 / external store',     lifetime: 'Across sessions & days', step: 4, color: 'bg-emerald-50 border-emerald-200 text-emerald-900' },
  { name: 'Audit trail',          where: 'History provider (audit)',  lifetime: 'Retention policy',      step: 4, color: 'bg-amber-50 border-amber-200 text-amber-900' },
];

const STEPS = [
  {
    id: 'overview',
    label: 'The use case',
    title: 'Use case: a personal assistant that remembers you',
    idea: 'We\'ll build one agent step by step. Each step adds exactly one idea from Microsoft Agent Framework, and by the end the assistant knows who you are, where you live, can call a tool, keeps context across turns and can be hosted in Foundry or on AKS / Web App.',
    render: () => (
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-sm font-semibold text-gray-800 mb-2">Memory is layered — each step adds a layer</p>
          <div className="flex flex-col gap-2">
            {MEMORY_LAYERS.map(l => (
              <div key={l.name} className={`border rounded-xl px-3 py-2 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 ${l.color}`}>
                <span className="text-sm font-bold sm:w-44 shrink-0">{l.name}</span>
                <span className="text-xs sm:flex-1">{l.where}</span>
                <span className="text-xs sm:w-44 shrink-0">{l.lifetime}</span>
                <Pill color="gray">Step {l.step}</Pill>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800 mb-2">The target conversation</p>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex flex-col gap-2 text-sm">
            {[
              ['user', 'Hi there!'],
              ['agent', 'Hello! I don\'t think we\'ve met — what\'s your name?'],
              ['user', 'My name is Alice and I live in Amsterdam.'],
              ['agent', 'Nice to meet you, Alice!'],
              ['user', 'What\'s the weather like at home?'],
              ['agent', 'Alice, in Amsterdam it\'s cloudy with a high of 15°C.'],
            ].map(([who, text], i) => (
              <div key={i} className={`flex ${who === 'user' ? 'justify-end' : 'justify-start'}`}>
                <span className={`max-w-[80%] rounded-2xl px-3 py-1.5 ${who === 'user' ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}>{text}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">Remembering the name needs memory (step 4). "At home" needs memory <em>and</em> a tool (step 2). Keeping the thread needs a session (step 3).</p>
        </div>
      </div>
    ),
  },
  {
    id: 'first',
    label: '1 · First agent',
    title: 'Step 1 — Your first agent',
    docs: `${DOCS}/your-first-agent?pivots=programming-language-python`,
    idea: 'An agent is a model plus instructions. The chat client knows how to talk to a model deployment in your Foundry project; the Agent wraps it with a name and a system prompt. run() returns the full answer; run(stream=True) yields tokens as they arrive.',
    concepts: ['FoundryChatClient', 'Agent', 'instructions', 'run()', 'streaming'],
    code: [
      { filename: 'terminal', lang: 'bash', code: STEP1_INSTALL },
      { filename: '01_hello_agent.py', code: STEP1_FIRST_AGENT },
    ],
    adds: 'The assistant can answer, but every call starts from zero. It has no tools and no memory.',
    callout: { kind: 'warn', title: 'Credentials', body: 'AzureCliCredential / DefaultAzureCredential is fine locally. In production use managed identity (Web App), Workload ID (AKS) or the Foundry agent identity. Agent Framework does not load .env files automatically — call load_dotenv() if you use one.' },
  },
  {
    id: 'tools',
    label: '2 · Tools',
    title: 'Step 2 — Give it tools',
    docs: `${DOCS}/add-tools?pivots=programming-language-python`,
    idea: 'A tool is a plain Python function with a description. The framework turns the signature and docstring into a schema the model can read; when the model decides it needs the tool, the framework calls your function and feeds the result back. approval_mode controls whether a human must confirm before it runs.',
    concepts: ['@tool', 'Annotated + Field descriptions', 'approval_mode', 'tools=[...]'],
    code: [{ filename: '02_add_tools.py', code: STEP2_TOOLS }],
    adds: 'The assistant can now act — it looks up weather. It still can\'t remember who asked or where "home" is.',
    callout: { kind: 'warn', title: 'Security: tools are where agents act', body: 'Use approval_mode="always_require" for anything that changes data or spends money. Give the identity running the agent only the permissions its tools need.' },
  },
  {
    id: 'multiturn',
    label: '3 · Multi-turn',
    title: 'Step 3 — Multi-turn conversations',
    docs: `${DOCS}/multi-turn?pivots=programming-language-python`,
    idea: 'A session is the conversation. Passing the same session to each run() lets the agent see earlier turns, so "what do you remember about me?" works. This is short-term memory: it lives as long as the session does.',
    concepts: ['create_session()', 'session=', 'short-term memory'],
    code: [{ filename: '03_multi_turn.py', code: STEP3_MULTI_TURN }],
    adds: 'The assistant keeps the thread of one conversation. Start a new session and it forgets everything.',
  },
  {
    id: 'memory',
    label: '4 · Memory',
    title: 'Step 4 — Memory & persistence',
    docs: `${DOCS}/memory?pivots=programming-language-python`,
    idea: 'A context provider hooks into every run. before_run() injects what the agent should know (e.g. "the user\'s name is Alice"); after_run() extracts new facts and writes them to state. History providers decide where conversation messages are stored, and you can stack several — local history, a long-term memory service like Mem0, and an audit store last.',
    concepts: ['ContextProvider', 'before_run / after_run', 'session.state', 'InMemoryHistoryProvider', 'Mem0ContextProvider', 'audit store'],
    code: [
      { filename: 'user_memory_provider.py', code: STEP4_PROVIDER },
      { filename: '04_memory.py', code: STEP4_RUN },
      { filename: 'layered_memory.py', code: STEP4_LAYERED, note: 'Only one history provider should have load_messages=True, so history isn\'t replayed twice.' },
    ],
    adds: 'The assistant now remembers facts about the user and uses them in later turns — the heart of the use case.',
    callout: { kind: 'idea', title: 'Where memory lives decides where you can host', body: 'In-memory providers vanish when the process restarts and aren\'t shared across replicas. Hosted in Foundry, conversations and the durable state store persist for you. Self-hosted on AKS or Web App, back memory with an external store before scaling out.' },
  },
  {
    id: 'workflow',
    label: '5 · Workflows',
    title: 'Step 5 — Workflows',
    docs: `${DOCS}/workflows?pivots=programming-language-python`,
    idea: 'When one agent loop isn\'t enough, a workflow chains executors with edges. Each executor handles a message and either sends it on (send_message) or yields a final output (yield_output). Executors can be plain functions, classes or agents — so you can build explicit pipelines like recall → answer → memorise.',
    concepts: ['Executor', '@handler', '@executor', 'WorkflowBuilder', 'add_edge', 'yield_output'],
    code: [{ filename: '05_first_workflow.py', code: STEP5_WORKFLOW }],
    adds: 'You can make memory steps explicit and deterministic instead of relying on the model to decide when to recall or store.',
  },
  {
    id: 'harness',
    label: '6 · Harness',
    title: 'Step 6 — Agent harness',
    docs: `${DOCS}/harness?pivots=programming-language-python`,
    idea: 'A harness wraps a chat client with the scaffolding long, multi-step tasks need: planning and execution modes, a todo list, context compaction, file memory, file access and "don\'t ask again" tool approval. The session carries the plan, todos and history across turns.',
    concepts: ['create_harness_agent', 'plan / todos', 'context compaction', 'file memory'],
    code: [{ filename: '06_harness.py', code: STEP6_HARNESS }],
    adds: 'For long-running tasks the harness manages working memory (plan, todos, compacted context) so the conversation doesn\'t overflow.',
  },
  {
    id: 'assemble',
    label: '7 · Assemble',
    title: 'Step 7 — Assemble the memory agent',
    idea: 'Now combine the pieces: the Foundry client from step 1, the weather tool from step 2, a session per conversation from step 3, and layered memory from step 4 — local history plus a provider extended to remember the user\'s home city. This is the agent you package and host.',
    concepts: ['tools', 'session', 'InMemoryHistoryProvider', 'UserMemoryProvider', 'DefaultAzureCredential'],
    code: [{ filename: 'memory_agent.py', code: MEMORY_AGENT_ASSEMBLED, note: 'Reference pattern assembled from the Microsoft samples in steps 1–4.' }],
    adds: 'A complete memory agent that runs locally. Next: wrap it in ResponsesHostServer(agent) and deploy it.',
  },
  {
    id: 'host',
    label: '8 · Host it',
    title: 'Step 8 — Host it',
    idea: 'To serve the agent, hand it to the Foundry protocol host: ResponsesHostServer(build_agent()).run(). That gives you an OpenAI-compatible POST /responses on port 8088. The same container can be deployed to Foundry, AKS or a Web App — see the Hosting tab for the full code per target.',
    concepts: ['ResponsesHostServer', '/responses', 'port 8088', 'container'],
    render: ({ goTo }) => (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="border border-indigo-200 bg-indigo-50 rounded-xl p-3 text-sm text-indigo-900">
          <p className="font-bold mb-1">Foundry-hosted</p>
          <p>Conversation history is managed by the platform (set <code className="text-xs">default_options={'{"store": False}'}</code>). Keep long-term user facts in the durable state store or Mem0 so they survive idle timeouts.</p>
        </div>
        <div className="border border-teal-200 bg-teal-50 rounded-xl p-3 text-sm text-teal-900">
          <p className="font-bold mb-1">Self-hosted (AKS / Web App)</p>
          <p>Replace the in-memory providers with an external store (e.g. Cosmos DB or Redis) and map each user to a session, so memory survives restarts and works across replicas.</p>
        </div>
        <button onClick={() => goTo('hosting')} className="md:col-span-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl px-4 py-2 transition-colors">
          Open the Hosting tab →
        </button>
      </div>
    ),
  },
];

export default function MemoryAgentPath({ goTo }) {
  const [active, setActive] = useState(0);
  const step = STEPS[active];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* Step list */}
        <nav className="w-full lg:w-56 shrink-0 lg:sticky lg:top-4">
          <ol className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible bg-white border border-gray-200 rounded-2xl p-2 shadow-sm">
            {STEPS.map((s, i) => (
              <li key={s.id} className="shrink-0">
                <button
                  onClick={() => setActive(i)}
                  className={`w-full text-left text-sm px-3 py-2 rounded-xl transition-colors whitespace-nowrap ${i === active ? 'bg-indigo-600 text-white font-semibold' : i < active ? 'text-indigo-700 hover:bg-indigo-50' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  {i < active ? '✓ ' : ''}{s.label}
                </button>
              </li>
            ))}
          </ol>
        </nav>

        {/* Step content */}
        <Card className="flex-1 min-w-0 w-full">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h2 className="text-lg font-bold text-gray-900">{step.title}</h2>
            {step.docs && <a href={step.docs} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline shrink-0">Microsoft docs ↗</a>}
          </div>

          <div className="bg-violet-50 border border-violet-200 rounded-xl px-4 py-3 mb-4">
            <p className="text-xs font-bold text-violet-700 uppercase tracking-wide mb-1">The idea</p>
            <p className="text-sm text-violet-950 leading-relaxed">{step.idea}</p>
          </div>

          {step.concepts && (
            <div className="flex flex-wrap gap-1 mb-4">
              {step.concepts.map(c => <Pill key={c} color="indigo">{c}</Pill>)}
            </div>
          )}

          {step.render && step.render({ goTo })}

          {step.code && (
            <div className="flex flex-col gap-3">
              {step.code.map(c => <CodeBlock key={c.filename} {...c} />)}
            </div>
          )}

          {step.adds && (
            <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
              <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-1">What this adds to the memory agent</p>
              <p className="text-sm text-emerald-950">{step.adds}</p>
            </div>
          )}

          {step.callout && <div className="mt-3"><Callout kind={step.callout.kind} title={step.callout.title}>{step.callout.body}</Callout></div>}

          <div className="flex justify-between mt-6">
            <button
              onClick={() => setActive(a => Math.max(0, a - 1))}
              disabled={active === 0}
              className="text-sm font-semibold px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← Back
            </button>
            <button
              onClick={() => setActive(a => Math.min(STEPS.length - 1, a + 1))}
              disabled={active === STEPS.length - 1}
              className="text-sm font-semibold px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        </Card>
      </div>

      <Sources links={[
        { label: 'Step 1: Your first agent', url: `${DOCS}/your-first-agent?pivots=programming-language-python` },
        { label: 'Step 2: Add tools', url: `${DOCS}/add-tools?pivots=programming-language-python` },
        { label: 'Step 3: Multi-turn conversations', url: `${DOCS}/multi-turn?pivots=programming-language-python` },
        { label: 'Step 4: Memory & persistence', url: `${DOCS}/memory?pivots=programming-language-python` },
        { label: 'Step 5: Workflows', url: `${DOCS}/workflows?pivots=programming-language-python` },
        { label: 'Step 6: Agent harness', url: `${DOCS}/harness?pivots=programming-language-python` },
      ]} />
    </div>
  );
}
