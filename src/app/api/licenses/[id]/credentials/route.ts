import { NextResponse } from "next/server";
import { z } from "zod";

import { requireSession } from "@/lib/api";
import { writeAuditLog } from "@/lib/audit";
import { encryptSecret } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

const credentialSchema = z.object({
  label: z.string().trim().min(1),
  username: z.string().optional().nullable(),
  password: z.string().min(1)
});

export async function POST(request: Request, context: Params) {
  const auth = await requireSession("credential:write");
  if ("error" in auth) return auth.error;
  const { id } = await context.params;

  const input = credentialSchema.parse(await request.json());
  const password = encryptSecret(input.password);
  const username = input.username ? encryptSecret(input.username) : null;

  const credential = await prisma.credentialSecret.create({
    data: {
      licenseId: id,
      label: input.label,
      usernameCipher: username?.cipher,
      usernameIv: username?.iv,
      usernameTag: username?.tag,
      passwordCipher: password.cipher,
      passwordIv: password.iv,
      passwordTag: password.tag
    },
    select: { id: true, label: true, createdAt: true }
  });

  await writeAuditLog({
    userId: auth.session.user.id,
    action: "credential_create",
    entity: "CredentialSecret",
    entityId: credential.id
  });
  return NextResponse.json({ credential }, { status: 201 });
}

export async function GET(_request: Request, context: Params) {
  const auth = await requireSession("license:read");
  if ("error" in auth) return auth.error;
  const { id } = await context.params;

  const credentials = await prisma.credentialSecret.findMany({
    where: { licenseId: id },
    select: { id: true, label: true, createdAt: true, updatedAt: true },
    orderBy: { label: "asc" }
  });
  return NextResponse.json({ credentials });
}
