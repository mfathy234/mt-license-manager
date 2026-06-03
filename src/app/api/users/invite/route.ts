import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { requireSession } from "@/lib/api";
import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";

const inviteSchema = z.object({
  name: z.string().trim().optional(),
  email: z.string().trim().email(),
  role: z.enum(["admin", "editor", "viewer"]),
  temporaryPassword: z.string().min(10)
});

export async function POST(request: Request) {
  const auth = await requireSession("users:write");
  if ("error" in auth) return auth.error;
  const input = inviteSchema.parse(await request.json());
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email.toLowerCase(),
      role: input.role,
      status: "active",
      passwordHash: await bcrypt.hash(input.temporaryPassword, 12)
    },
    select: { id: true, email: true, role: true, status: true }
  });
  await writeAuditLog({ userId: auth.session.user.id, action: "user_update", entity: "User", entityId: user.id });
  return NextResponse.json({ user }, { status: 201 });
}
