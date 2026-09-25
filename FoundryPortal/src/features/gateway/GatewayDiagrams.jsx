import React from 'react';

// Palette shared by all gateway diagrams.
const C = {
  ink: '#0f172a',
  sub: '#475569',
  line: '#64748b',
  indigo: '#4f46e5',
  indigoBg: '#eef2ff',
  indigoBorder: '#a5b4fc',
  teal: '#0d9488',
  tealBg: '#f0fdfa',
  tealBorder: '#5eead4',
  sky: '#0284c7',
  skyBg: '#f0f9ff',
  skyBorder: '#7dd3fc',
  slateBg: '#f8fafc',
  slateBorder: '#cbd5e1',
  red: '#dc2626',
  redBg: '#fef2f2',
  redBorder: '#fca5a5',
  green: '#059669',
  greenBg: '#ecfdf5',
  greenBorder: '#6ee7b7',
  amber: '#d97706',
  amberBg: '#fffbeb',
  amberBorder: '#fcd34d',
  white: '#ffffff',
};

const Markers = ({ id }) => (
  <defs>
    {[['line', C.line], ['indigo', C.indigo], ['teal', C.teal], ['red', C.red], ['green', C.green], ['amber', C.amber]].map(([k, color]) => (
      <marker key={k} id={`${id}-${k}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" fill={color} />
      </marker>
    ))}
  </defs>
);

const Box = ({ x, y, w, h, title, sub, fill = C.white, stroke = C.slateBorder, color = C.ink, subColor = C.sub, rx = 10, dashed }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={rx} fill={fill} stroke={stroke} strokeWidth="1.5" strokeDasharray={dashed ? '5 4' : undefined} />
    <text x={x + w / 2} y={sub ? y + h / 2 - 3 : y + h / 2 + 4} textAnchor="middle" fontSize="13" fontWeight="700" fill={color}>{title}</text>
    {sub && <text x={x + w / 2} y={y + h / 2 + 13} textAnchor="middle" fontSize="11" fill={subColor}>{sub}</text>}
  </g>
);

const Arrow = ({ id, x1, y1, x2, y2, color = 'line', dashed, width = 1.6 }) => {
  const stroke = { line: C.line, indigo: C.indigo, teal: C.teal, red: C.red, green: C.green, amber: C.amber }[color];
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} strokeWidth={width} strokeDasharray={dashed ? '6 4' : undefined} markerEnd={`url(#${id}-${color})`} />;
};

const Label = ({ x, y, children, anchor = 'middle', color = C.sub, size = 11, weight = 500, bg = true, w }) => (
  <g>
    {bg && w && <rect x={anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x} y={y - 11} width={w} height={15} rx="4" fill={C.white} opacity="0.92" />}
    <text x={x} y={y} textAnchor={anchor} fontSize={size} fontWeight={weight} fill={color}>{children}</text>
  </g>
);

// ---------------------------------------------------------------------------
// 1. Architecture: consumers → gateway policy pipeline → backends, with the
//    control plane underneath.
// ---------------------------------------------------------------------------
const CONSUMERS = [
  ['Web App', 'App Service · managed identity'],
  ['AKS / ARO apps', 'Workload ID'],
  ['On-prem & other clouds', 'Entra app or subscription key'],
  ['Copilot Studio / M365', 'connector to the gateway'],
  ['Custom & Foundry agents', 'bring-your-own model'],
];
const BACKENDS = [
  ['Foundry models · PTU', 'priority 1'],
  ['Foundry models · PAYG', 'fallback · second region'],
  ['Foundry hosted agents', 'Responses / A2A'],
  ['MCP tools', 'REST APIs exposed as MCP'],
  ['Self-hosted models', 'AKS / ARO (vLLM, KAITO)'],
];
const ROW_Y = [60, 122, 184, 246, 308];
const PIPELINE = [
  // serpentine: row 1 left→right, row 2 right→left
  { n: 1, t: 'Authenticate', s: 'Entra token · key', x: 346, y: 92 },
  { n: 2, t: 'Token limit', s: 'TPM + quota', x: 486, y: 92 },
  { n: 3, t: 'Content safety', s: 'Prompt Shields', x: 626, y: 92 },
  { n: 4, t: 'Semantic cache', s: 'Managed Redis', x: 626, y: 176 },
  { n: 5, t: 'Load balance', s: 'PTU → PAYG', x: 486, y: 176 },
  { n: 6, t: 'Log & meter', s: 'token metrics', x: 346, y: 176 },
];
const CONTROL = [
  ['AIHub Portal', 'catalog · request access · usage'],
  ['Microsoft Entra ID', 'app roles · managed identities'],
  ['Azure API Center', 'models, agents, MCP catalog'],
  ['APIM developer portal', 'keys · products · try-it'],
  ['Azure Monitor', 'App Insights · token metrics'],
];

export function ArchitectureDiagram() {
  const id = 'arch';
  return (
    <div className="w-full overflow-x-auto">
      <svg role="img" aria-label="AI gateway architecture: consumers, gateway policy pipeline, backends and control plane" viewBox="0 0 1100 570" style={{ minWidth: 760, width: '100%', fontFamily: 'inherit', display: 'block' }}>
        <Markers id={id} />

        {/* Column headers */}
        <text x="130" y="32" textAnchor="middle" fontSize="12" fontWeight="700" fill={C.sky} letterSpacing="0.5">APPS OUTSIDE FOUNDRY</text>
        <text x="550" y="32" textAnchor="middle" fontSize="12" fontWeight="700" fill={C.indigo} letterSpacing="0.5">AI GATEWAY · AZURE API MANAGEMENT</text>
        <text x="970" y="32" textAnchor="middle" fontSize="12" fontWeight="700" fill={C.teal} letterSpacing="0.5">AI BACKENDS</text>

        {/* Consumers */}
        {CONSUMERS.map(([t, s], i) => (
          <Box key={t} x={20} y={ROW_Y[i]} w={220} h={50} title={t} sub={s} fill={C.skyBg} stroke={C.skyBorder} />
        ))}
        {ROW_Y.map(y => <Arrow key={`c${y}`} id={id} x1={242} y1={y + 25} x2={328} y2={y + 25} color="indigo" />)}

        {/* Gateway */}
        <rect x="330" y="50" width="440" height="310" rx="16" fill={C.indigoBg} stroke={C.indigoBorder} strokeWidth="2" />
        <text x="550" y="78" textAnchor="middle" fontSize="12" fontWeight="600" fill={C.indigo}>Policy pipeline — runs on every request</text>
        {PIPELINE.map(p => (
          <g key={p.n}>
            <Box x={p.x} y={p.y} w={128} h={54} title={p.t} sub={p.s} stroke={C.indigoBorder} />
            <circle cx={p.x + 2} cy={p.y + 2} r="9" fill={C.indigo} stroke={C.white} strokeWidth="2" />
            <text x={p.x + 2} y={p.y + 6} textAnchor="middle" fontSize="11" fontWeight="700" fill={C.white}>{p.n}</text>
          </g>
        ))}
        <Arrow id={id} x1={475} y1={119} x2={484} y2={119} color="indigo" />
        <Arrow id={id} x1={615} y1={119} x2={624} y2={119} color="indigo" />
        <Arrow id={id} x1={690} y1={147} x2={690} y2={174} color="indigo" />
        <Arrow id={id} x1={625} y1={203} x2={616} y2={203} color="indigo" />
        <Arrow id={id} x1={485} y1={203} x2={476} y2={203} color="indigo" />
        <rect x="346" y="248" width="408" height="40" rx="10" fill={C.white} stroke={C.slateBorder} />
        <text x="550" y="273" textAnchor="middle" fontSize="12" fill={C.sub}>Products · subscriptions · backend pools · named values</text>
        <text x="550" y="316" textAnchor="middle" fontSize="12.5" fontWeight="700" fill={C.ink} fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">https://&lt;apim&gt;.azure-api.net/…</text>
        <text x="550" y="336" textAnchor="middle" fontSize="11" fill={C.sub}>One front door · OpenAI-compatible · MCP · A2A</text>

        {/* Backends */}
        {ROW_Y.map(y => <Arrow key={`b${y}`} id={id} x1={772} y1={y + 25} x2={858} y2={y + 25} color="teal" />)}
        {BACKENDS.map(([t, s], i) => (
          <Box key={t} x={860} y={ROW_Y[i]} w={220} h={50} title={t} sub={s} fill={C.tealBg} stroke={C.tealBorder} />
        ))}
        <Label x={815} y={50} color={C.teal} size={10.5} bg={false}>managed identity</Label>
        <Label x={285} y={50} color={C.indigo} size={10.5} bg={false}>HTTPS + identity</Label>

        {/* Control plane */}
        <rect x="20" y="410" width="1060" height="148" rx="16" fill={C.slateBg} stroke={C.slateBorder} strokeWidth="1.5" strokeDasharray="7 5" />
        <text x="40" y="542" fontSize="12" fontWeight="700" fill={C.sub} letterSpacing="0.5">CONTROL PLANE — onboarding, access and visibility</text>
        {CONTROL.map(([t, s], i) => (
          <Box key={t} x={35 + i * 208} y={448} w={196} h={62} title={t} sub={s} dashed />
        ))}
        {/* Control-plane links (dashed) */}
        <Arrow id={id} x1={130} y1={446} x2={130} y2={362} color="line" dashed />
        <Label x={130} y={396} w={138}>endpoint + credentials</Label>
        <Arrow id={id} x1={420} y1={446} x2={420} y2={362} color="line" dashed />
        <Label x={420} y={400} w={92}>validate tokens</Label>
        <Arrow id={id} x1={700} y1={446} x2={700} y2={362} color="line" dashed />
        <Label x={700} y={396} w={156}>products, quotas, policies</Label>
        <Arrow id={id} x1={766} y1={362} x2={930} y2={446} color="line" dashed />
        <Label x={880} y={404} w={96}>metrics & logs</Label>

        {/* Legend */}
        <line x1="650" y1="538" x2="690" y2="538" stroke={C.indigo} strokeWidth="1.6" />
        <text x="698" y="542" fontSize="11" fill={C.sub}>data plane — runtime calls</text>
        <line x1="860" y1="538" x2="900" y2="538" stroke={C.line} strokeWidth="1.6" strokeDasharray="6 4" />
        <text x="908" y="542" fontSize="11" fill={C.sub}>control plane — setup</text>
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. Onboarding sequence: how an app team gets an endpoint.
// ---------------------------------------------------------------------------
const ACTORS = [
  { name: 'Developer', sub: 'app team', x: 95, color: C.sky, bg: C.skyBg, border: C.skyBorder },
  { name: 'AIHub Portal', sub: '+ API Center catalog', x: 285, color: C.indigo, bg: C.indigoBg, border: C.indigoBorder },
  { name: 'Platform team', sub: 'approves access', x: 475, color: C.ink, bg: C.slateBg, border: C.slateBorder },
  { name: 'API Management', sub: 'AI gateway', x: 665, color: C.indigo, bg: C.indigoBg, border: C.indigoBorder },
  { name: 'Entra ID', sub: 'identities & roles', x: 855, color: C.ink, bg: C.slateBg, border: C.slateBorder },
  { name: 'Your app', sub: 'AKS · Web App · on-prem', x: 1010, color: C.teal, bg: C.tealBg, border: C.tealBorder },
];
const AX = Object.fromEntries(ACTORS.map((a, i) => [i, a.x]));
const MESSAGES = [
  { from: 0, to: 1, text: 'Browse models, agents, tools' },
  { from: 1, to: 0, text: 'Region, limits, cost', ret: true },
  { from: 0, to: 1, text: 'Request access (model, TPM)' },
  { from: 1, to: 2, text: 'Approval task' },
  { from: 2, to: 3, text: 'Subscription + token quota' },
  { from: 2, to: 4, text: 'Grant app role to the app\'s identity' },
  { from: 3, to: 0, text: 'Endpoint URL + key → Key Vault', ret: true },
  { from: 0, to: 5, text: 'Configure endpoint, identity and key reference' },
  { from: 5, to: 4, text: 'Request token' },
  { from: 4, to: 5, text: 'JWT for gateway', ret: true },
  { from: 5, to: 3, text: 'Call model through the gateway' },
  { from: 3, to: 5, text: 'Completion + x-remaining-tokens', ret: true },
];
const PHASES = [
  { label: 'DISCOVER', first: 0, last: 1 },
  { label: 'REQUEST', first: 2, last: 5 },
  { label: 'CONFIGURE', first: 6, last: 7 },
  { label: 'CALL', first: 8, last: 11 },
];
const MSG_Y0 = 104;
const MSG_STEP = 36;

export function OnboardingSequenceDiagram() {
  const id = 'seq';
  const my = i => MSG_Y0 + i * MSG_STEP;
  return (
    <div className="w-full overflow-x-auto">
      <svg role="img" aria-label="Sequence: how an app team gets a gateway endpoint and calls a model" viewBox="0 0 1100 540" style={{ minWidth: 820, width: '100%', fontFamily: 'inherit', display: 'block' }}>
        <Markers id={id} />

        {/* Phase bands */}
        {PHASES.map((p, i) => (
          <g key={p.label}>
            <rect x="8" y={my(p.first) - 24} width="1084" height={my(p.last) - my(p.first) + 36} rx="8" fill={i % 2 ? C.white : C.slateBg} />
            <text x="16" y={my(p.first) - 10} fontSize="9.5" fontWeight="700" fill={C.line} letterSpacing="0.8">{p.label}</text>
          </g>
        ))}

        {/* Actors + lifelines */}
        {ACTORS.map(a => (
          <g key={a.name}>
            <line x1={a.x} y1={62} x2={a.x} y2={528} stroke={C.slateBorder} strokeWidth="1.3" strokeDasharray="4 4" />
            <rect x={a.x - 75} y={12} width={150} height={48} rx="10" fill={a.bg} stroke={a.border} strokeWidth="1.5" />
            <text x={a.x} y={33} textAnchor="middle" fontSize="13" fontWeight="700" fill={a.color}>{a.name}</text>
            <text x={a.x} y={49} textAnchor="middle" fontSize="10.5" fill={C.sub}>{a.sub}</text>
          </g>
        ))}

        {/* Messages */}
        {MESSAGES.map((m, i) => {
          const x1 = AX[m.from];
          const x2 = AX[m.to];
          const dir = x2 > x1 ? 1 : -1;
          const y = my(i);
          const mid = (x1 + x2) / 2;
          return (
            <g key={i}>
              <Arrow id={id} x1={x1 + dir * 4} y1={y} x2={x2 - dir * 5} y2={y} color={m.ret ? 'line' : 'indigo'} dashed={m.ret} />
              <circle cx={mid - m.text.length * 2.9 - 12} cy={y - 10} r="8" fill={m.ret ? C.line : C.indigo} />
              <text x={mid - m.text.length * 2.9 - 12} y={y - 6.5} textAnchor="middle" fontSize="10" fontWeight="700" fill={C.white}>{i + 1}</text>
              <text x={mid} y={y - 6} textAnchor="middle" fontSize="11.5" fill={C.ink}>{m.text}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3. Runtime request flow with failure branches and the usage feedback loop.
// ---------------------------------------------------------------------------
const FLOW = [
  { t: 'Your app', s: 'OpenAI SDK', fill: C.skyBg, stroke: C.skyBorder },
  { t: 'Authenticate', s: 'validate token', fill: C.white, stroke: C.indigoBorder },
  { t: 'Token limit', s: 'TPM · quota', fill: C.white, stroke: C.indigoBorder },
  { t: 'Content safety', s: 'Prompt Shields', fill: C.white, stroke: C.indigoBorder },
  { t: 'Semantic cache', s: 'lookup', fill: C.white, stroke: C.indigoBorder },
  { t: 'Backend pool', s: 'priority routing', fill: C.white, stroke: C.indigoBorder },
  { t: 'Foundry model', s: 'PTU or PAYG', fill: C.tealBg, stroke: C.tealBorder },
];
const FX = i => 20 + i * 152;
const FCX = i => FX(i) + 59;
const BRANCHES = [
  { at: 1, t: '401 Unauthorized', s: 'bad or missing token', kind: 'red' },
  { at: 2, t: '429 + Retry-After', s: 'budget exhausted', kind: 'red' },
  { at: 3, t: '403 Blocked', s: 'jailbreak / harmful', kind: 'red' },
  { at: 4, t: 'Cache hit', s: 'return stored answer', kind: 'green' },
  { at: 5, t: 'PTU busy (429)', s: 'breaker trips → PAYG', kind: 'amber' },
];
const KIND = {
  red: { fill: C.redBg, stroke: C.redBorder, color: C.red },
  green: { fill: C.greenBg, stroke: C.greenBorder, color: C.green },
  amber: { fill: C.amberBg, stroke: C.amberBorder, color: C.amber },
};

export function RequestFlowDiagram() {
  const id = 'flow';
  return (
    <div className="w-full overflow-x-auto">
      <svg role="img" aria-label="Runtime request flow through the AI gateway" viewBox="0 0 1100 350" style={{ minWidth: 820, width: '100%', fontFamily: 'inherit', display: 'block' }}>
        <Markers id={id} />
        <rect x={FX(1) - 10} y="34" width={FX(5) + 128 - FX(1)} height="98" rx="14" fill={C.indigoBg} stroke={C.indigoBorder} strokeDasharray="6 4" />
        <text x={(FX(1) + FX(5) + 118) / 2} y="26" textAnchor="middle" fontSize="11" fontWeight="700" fill={C.indigo} letterSpacing="0.6">INSIDE THE GATEWAY</text>

        {FLOW.map((n, i) => <Box key={n.t} x={FX(i)} y={55} w={118} h={60} title={n.t} sub={n.s} fill={n.fill} stroke={n.stroke} />)}
        {FLOW.slice(0, -1).map((_, i) => <Arrow key={i} id={id} x1={FX(i) + 119} y1={85} x2={FX(i + 1) - 2} y2={85} color="indigo" />)}

        {BRANCHES.map(b => {
          const k = KIND[b.kind];
          return (
            <g key={b.t}>
              <Arrow id={id} x1={FCX(b.at)} y1={134} x2={FCX(b.at)} y2={170} color={b.kind} dashed />
              <Box x={FCX(b.at) - 66} y={172} w={132} h={54} title={b.t} sub={b.s} fill={k.fill} stroke={k.stroke} color={k.color} />
            </g>
          );
        })}
        {/* PAYG retry goes on to the model */}
        <Arrow id={id} x1={FCX(5) + 66} y1={199} x2={FX(6) + 30} y2={117} color="amber" dashed />
        {/* Errors return to the app */}
        <text x={FCX(2)} y={244} textAnchor="middle" fontSize="10.5" fill={C.red}>errors return straight to the app</text>

        {/* Return path with metering */}
        <polyline points={`${FCX(6)},116 ${FCX(6)},300 ${FCX(0)},300 ${FCX(0)},118`} fill="none" stroke={C.teal} strokeWidth="1.8" markerEnd={`url(#${id}-teal)`} />
        <line x1={FCX(4)} y1={227} x2={FCX(4)} y2={298} stroke={C.green} strokeWidth="1.6" strokeDasharray="6 4" />
        <rect x={FCX(4) + 60} y={288} width={250} height={24} rx="12" fill={C.white} stroke={C.tealBorder} />
        <text x={FCX(4) + 185} y={304} textAnchor="middle" fontSize="11" fontWeight="600" fill={C.teal}>llm-emit-token-metric · cache store</text>
        <text x="550" y="332" textAnchor="middle" fontSize="11.5" fill={C.sub}>Response flows back to the app · token usage lands in App Insights and the usage counter the AIHub Consumption panel reads</text>
      </svg>
    </div>
  );
}
