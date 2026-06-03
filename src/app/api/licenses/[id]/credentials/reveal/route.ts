import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError, requireSession } from "@/lib/api";
import { writeAuditLog } from "@/lib/audit";
import { decryptSecret } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

const revealSchema = z.object({ credentialId: z.string() });

export async function POST(request: Request, context: Params) {
  const auth = await requireSession("credential:read");
  if ("error" in auth) return auth.error;
  const { id } = await context.params;
  const { credentialId } = revealSchema.parse(await request.json());

  const credential = await prisma.credentialSecret.findFirst({ where: { id: credentialId, licenseId: id } });
  if (!credential) return jsonError("Credential not found.", 404);

  const username =
    credential.usernameCipher && credential.usernameIv && credential.usernameTag
      ? decryptSecret({
          cipher: credential.usernameCipher,
          iv: credential.usernameIv,
          tag: credential.usernameTag
        })
      : null;
  const password = decryptSecret({
    cipher: credential.passwordCipher,
    iv: credential.passwordIv,
    tag: credential.passwordTag
  });

  await writeAuditLog({
    userId: auth.session.user.id,
    action: "credential_reveal",
    entity: "CredentialSecret",
    entityId: credential.id
  });

  return NextResponse.json({ username, password });
}
