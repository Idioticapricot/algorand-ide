import { NextResponse } from "next/server";
import { redirect } from "next/navigation";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const encoded = searchParams.get('contract');

    if (!encoded) {
      return NextResponse.json({ error: "No contract parameter provided" }, { status: 400 });
    }

    // Redirect to PuyaTs template with contract in query
    return NextResponse.redirect(new URL(`/puyats?contract=${encoded}`, req.url));
  } catch (error: any) {
    console.error("[LOAD-CONTRACT] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { encoded } = await req.json();

    if (!encoded) {
      return NextResponse.json({ error: "No encoded data provided" }, { status: 400 });
    }

    const code = Buffer.from(encoded, "base64").toString("utf-8");

    return NextResponse.json({ 
      success: true, 
      code,
      filename: "contract.algo.ts"
    });
  } catch (error: any) {
    console.error("[LOAD-CONTRACT] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
