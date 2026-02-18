"use client";

import { useEffect, useState } from "react";
import SidebarLayout from "@/components/dashboard/SidebarLayout";

type TemplateField = {
  name: string;
  type: string;
  required: boolean;
  description?: string;
};

type Template = {
  id: string;
  version: string;
  description: string;
  fields: TemplateField[];
  resolution: { width: number; height: number; fps: number };
  defaultDurationSeconds: number;
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);

  useEffect(() => {
    fetch("/api/v1/templates")
      .then((res) => res.json())
      .then((data) => setTemplates(Array.isArray(data.templates) ? data.templates : []))
      .catch(() => setTemplates([]));
  }, []);

  return (
    <SidebarLayout title="Templates" subtitle="Versioned, code-defined templates available for renders.">
      <div className="space-y-4">
        {templates.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-6 text-sm text-zinc-600">
            No templates registered yet.
          </div>
        ) : (
          templates.map((template) => (
            <div key={template.id} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900">{template.id}</h2>
                  <p className="mt-1 text-sm text-zinc-600">{template.description}</p>
                  <p className="mt-1 text-xs text-zinc-500">Version {template.version}</p>
                </div>
                <div className="text-xs text-zinc-500">
                  {template.resolution.width}x{template.resolution.height} - {template.resolution.fps}fps - default {template.defaultDurationSeconds}s
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {template.fields.map((field) => (
                  <div key={field.name} className="rounded-xl border border-zinc-200 bg-[var(--muted-bg)] p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-700">{field.name}</span>
                      <span className="text-[11px] text-zinc-500">
                        {field.type}{field.required ? " - required" : " - optional"}
                      </span>
                    </div>
                    {field.description && (
                      <p className="mt-2 text-xs text-zinc-500">{field.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </SidebarLayout>
  );
}
