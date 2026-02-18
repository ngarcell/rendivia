"use client";

import React from "react";

interface CodeBlockProps {
  title?: string;
  code: string;
  footnote?: string;
}

export default function CodeBlock({ title, code, footnote }: CodeBlockProps) {
  return (
    <div className="rounded-[var(--radius-card)] border border-zinc-900/10 bg-zinc-950 p-5 text-zinc-100 shadow-[var(--shadow-card)]">
      {title && (
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
          {title}
        </p>
      )}
      <pre className="overflow-x-auto text-sm leading-relaxed">
        <code>{code}</code>
      </pre>
      {footnote && (
        <p className="mt-3 text-xs text-zinc-400">{footnote}</p>
      )}
    </div>
  );
}
