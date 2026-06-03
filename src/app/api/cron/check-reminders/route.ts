import { NextResponse } from "next/server";

import { sendLicenseNotification } from "@/lib/email";
import { dueReminderConfig } from "@/lib/reminders";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const expected = process.env.CRON_SECRET;
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!expected || token !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const configs = await prisma.reminderConfig.findMany({ where: { enabled: true } });
  const licenses = await prisma.license.findMany({
    where: { expiryDate: { gte: now } },
    orderBy: { expiryDate: "asc" }
  });

  let checked = 0;
  let sent = 0;
  let failed = 0;
  for (const license of licenses) {
    const due = dueReminderConfig(license.expiryDate, configs, now);
    if (!due) continue;
    checked += 1;

    const alreadySent = await prisma.notificationHistory.findFirst({
      where: {
        licenseId: license.id,
        kind: "expiry_reminder",
        status: "sent",
        createdAt: {
          gte: new Date(now.getFullYear(), now.getMonth(), now.getDate())
        }
      }
    });
    if (alreadySent) continue;

    const result = await sendLicenseNotification(license.id, "expiry_reminder");
    sent += result.sent;
    failed += result.failed;
  }

  return NextResponse.json({ checked, sent, failed });
}
