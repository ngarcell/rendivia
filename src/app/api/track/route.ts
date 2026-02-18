import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    console.info("Track event:", payload);
  } catch {
    // ignore parse errors
  }

  return new NextResponse(null, { status: 204 });
}
