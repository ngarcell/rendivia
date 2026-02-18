import { NextResponse } from "next/server";
import { listTemplates } from "@/lib/video-templates";

export async function GET() {
  return NextResponse.json({ templates: listTemplates() });
}
