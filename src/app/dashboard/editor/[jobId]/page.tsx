import Link from "next/link";
import CaptionEditorClient from "@/components/CaptionEditorClient";
import DashboardShell from "@/components/dashboard/DashboardShell";

export default function CaptionEditorPage({ params }: { params: { jobId: string } }) {
  return (
    <DashboardShell
      title="Caption editor"
      subtitle="Refine transcripts, adjust timing, and render production-ready clips."
      wide
      actions={
        <Link
          href={`/dashboard/projects/${params.jobId}`}
          className="touch-target inline-flex min-h-[44px] items-center justify-center rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:border-zinc-300"
        >
          Project overview
        </Link>
      }
    >
      <CaptionEditorClient jobId={params.jobId} embedded />
    </DashboardShell>
  );
}
