import React, { useState } from 'react';

export const CodeBlock = ({ code, filename, lang = 'python', note }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }).catch(() => {});
  };
  return (
    <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-900 shadow-sm">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 border-b border-slate-700">
        <span className="text-xs font-mono text-slate-300 truncate">{filename || lang}</span>
        {filename && <span className="text-[10px] uppercase tracking-wide text-slate-500">{lang}</span>}
        <button
          onClick={copy}
          className="ml-auto text-xs text-slate-300 hover:text-white px-2 py-0.5 rounded border border-slate-600 hover:border-slate-400 transition-colors"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="text-xs leading-relaxed text-slate-100 p-3 overflow-x-auto"><code>{code}</code></pre>
      {note && <p className="text-xs text-slate-400 px-3 pb-2 -mt-1">{note}</p>}
    </div>
  );
};

const PILL_COLORS = {
  gray:    'bg-gray-100 text-gray-700 border-gray-200',
  blue:    'bg-blue-50 text-blue-700 border-blue-200',
  indigo:  'bg-indigo-50 text-indigo-700 border-indigo-200',
  violet:  'bg-violet-50 text-violet-700 border-violet-200',
  teal:    'bg-teal-50 text-teal-700 border-teal-200',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  amber:   'bg-amber-50 text-amber-800 border-amber-200',
  red:     'bg-red-50 text-red-700 border-red-200',
  sky:     'bg-sky-50 text-sky-700 border-sky-200',
};

export const Pill = ({ children, color = 'gray' }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${PILL_COLORS[color] || PILL_COLORS.gray}`}>
    {children}
  </span>
);

export const Card = ({ children, className = '' }) => (
  <div className={`bg-white border border-gray-200 rounded-2xl p-4 md:p-6 shadow-sm ${className}`}>{children}</div>
);

export const SectionTitle = ({ title, subtitle }) => (
  <div className="mb-4">
    <h2 className="text-lg font-bold text-gray-900">{title}</h2>
    {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
  </div>
);

const CALLOUT_STYLES = {
  info:    'bg-blue-50 border-blue-200 text-blue-900',
  warn:    'bg-amber-50 border-amber-200 text-amber-900',
  success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
  idea:    'bg-violet-50 border-violet-200 text-violet-900',
};

export const Callout = ({ kind = 'info', title, children }) => (
  <div className={`border rounded-xl px-4 py-3 text-sm ${CALLOUT_STYLES[kind] || CALLOUT_STYLES.info}`}>
    {title && <p className="font-semibold mb-1">{title}</p>}
    <div className="leading-relaxed">{children}</div>
  </div>
);

export const Sources = ({ links }) => (
  <div className="mt-6 pt-4 border-t border-gray-100">
    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Sources</p>
    <ul className="flex flex-col gap-1">
      {links.map(l => (
        <li key={l.url}>
          <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">{l.label} ↗</a>
        </li>
      ))}
    </ul>
  </div>
);

export const ProsCons = ({ pros, cons }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
      <p className="text-xs font-bold text-emerald-800 uppercase tracking-wide mb-2">Pros</p>
      <ul className="flex flex-col gap-1.5">
        {pros.map(p => (
          <li key={p} className="flex gap-2 text-xs text-emerald-900"><span className="shrink-0">✓</span><span>{p}</span></li>
        ))}
      </ul>
    </div>
    <div className="bg-red-50 border border-red-200 rounded-xl p-3">
      <p className="text-xs font-bold text-red-800 uppercase tracking-wide mb-2">Cons</p>
      <ul className="flex flex-col gap-1.5">
        {cons.map(c => (
          <li key={c} className="flex gap-2 text-xs text-red-900"><span className="shrink-0">✕</span><span>{c}</span></li>
        ))}
      </ul>
    </div>
  </div>
);

export const Segmented = ({ options, value, onChange, size = 'md' }) => (
  <div className="inline-flex flex-wrap gap-1 bg-gray-100 border border-gray-200 rounded-xl p-1">
    {options.map(o => {
      const active = o.id === value;
      return (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={`${size === 'sm' ? 'text-xs px-2.5 py-1' : 'text-sm px-3 py-1.5'} rounded-lg font-semibold transition-colors ${active ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
        >
          {o.label}
        </button>
      );
    })}
  </div>
);
