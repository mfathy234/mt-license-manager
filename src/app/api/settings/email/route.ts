import { NextResponse } from "next/server";
import { z } from "zod";

import { requireSession } from "@/lib/api";
import { writeAuditLog } from "@/lib/audit";
import { upsertSmtpSettings } from "@/lib/email";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  host: z.string().trim().optional().nullable(),
  port: z.coerce.number().int().min(1).max(65535).default(587),
  secure: z.boolean().default(false),
  username: z.string().trim().optional().nullable(),
  password: z.string().optional().nullable(),
  fromName: z.string().trim().optional().nullable(),
  fromEmail: z.string().trim().email().optional().nullable()
});

export async function GET() {
  const auth = await requireSession("settings:write");
  if ("error" in auth) return auth.error;
  const settings = await prisma.smtpSettings.findUnique({ where: { id: "default" } });
  return NextResponse.json({
    settings: settings
      ? {
          host: settings.host,
          port: settings.port,
          secure: settings.secure,
          username: settings.username,
          fromName: settings.fromName,
          fromEmail: settings.fromEmail,
          hasPassword: Boolean(settings.passwordCipher)
        }
      : null
  });
}

export async function PUT(request: Request) {
  const auth = await requireSession("settings:write");
  if ("error" in auth) return auth.error;
  const input = schema.parse(await request.json());
  const settings = await upsertSmtpSettings(input);
  await writeAuditLog({ userId: auth.session.user.id, action: "settings_update", entity: "SmtpSettings", entityId: settings.id });
  return NextResponse.json({ ok: true });
}
