import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";

export async function POST(request: NextRequest) {
  const body = await request.text();

  // Verify webhook signature if secret is configured
  const secret = process.env.GITHUB_MARKETPLACE_SECRET;
  if (secret) {
    const signature = request.headers.get("x-hub-signature-256");
    if (signature) {
      const expected = "sha256=" + createHmac("sha256", secret).update(body).digest("hex");
      if (signature !== expected) {
        console.error("Marketplace webhook: invalid signature");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }
  }

  // Parse the event
  const event = request.headers.get("x-github-event");
  let payload;
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const action = payload.action;
  const account = payload.marketplace_purchase?.account?.login || "unknown";

  // Log the event
  console.log(`Marketplace event: ${event} / ${action} from ${account}`);

  // Handle events (sphinx-ci is free, so we just acknowledge)
  switch (action) {
    case "purchased":
      console.log(`New installation: ${account}`);
      break;
    case "cancelled":
      console.log(`Cancelled: ${account}`);
      break;
    case "changed":
      console.log(`Plan changed: ${account}`);
      break;
    case "pending_change":
      console.log(`Pending change: ${account}`);
      break;
    case "pending_change_cancelled":
      console.log(`Pending change cancelled: ${account}`);
      break;
    default:
      console.log(`Unhandled action: ${action}`);
  }

  return NextResponse.json({ received: true });
}
