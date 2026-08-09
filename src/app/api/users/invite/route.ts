import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { handleApiError, jsonError, requireSession, zodMessage } from "@/lib/api";
import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";

const inviteSchema = z.object({
  name: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : null)),
  email: z.string().trim().email("Enter a valid email address."),
  role: z.enum(["admin", "editor", "viewer"], { errorMap: () => ({ message: "Pick a role." }) }),
  temporaryPassword: z.string().min(10, "Temporary password must be at least 10 characters.")
});

export async function POST(request: Request) {
  const auth = await requireSession("users:write");
  if ("error" in auth) return auth.error;

  try {
    const parsed = inviteSchema.safeParse(await request.json());
    if (!parsed.success) return jsonError(zodMessage(parsed.error));

    const input = parsed.data;
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
  } catch (error) {
    return handleApiError(error, { conflictMessage: "A user with that email address already exists." });
  }
}
