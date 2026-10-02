import { NextResponse } from "next/server";
import { getReports, getAdminAuditLogs } from "@/lib/moderation";

export async function GET() {
  try {
    const reports = getReports();
    const auditLogs = getAdminAuditLogs();
    return NextResponse.json({ reports, auditLogs });
  } catch (error) {
    console.error("Admin data error:", error);
    return NextResponse.json({ error: "Failed to fetch admin data." }, { status: 500 });
  }
}
