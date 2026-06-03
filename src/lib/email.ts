import type { NotificationKind } from "@prisma/client";
import nodemailer from "nodemailer";

import { decryptSecret, encryptSecret } from "@/lib/crypto";
import { decryptLicense } from "@/lib/license-secure";
import { prisma } from "@/lib/prisma";

export async function upsertSmtpSettings(input: {
  host?: string | null;
  port?: number;
  secure?: boolean;
  username?: string | null;
  password?: string | null;
  fromName?: string | null;
  fromEmail?: string | null;
}) {
  const encrypted = input.password ? encryptSecret(input.password) : null;
  return prisma.smtpSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      host: input.host,
      port: input.port ?? 587,
      secure: input.secure ?? false,
      username: input.username,
      passwordCipher: encrypted?.cipher,
      passwordIv: encrypted?.iv,
      passwordTag: encrypted?.tag,
      fromName: input.fromName,
      fromEmail: input.fromEmail
    },
    update: {
      host: input.host,
      port: input.port ?? 587,
      secure: input.secure ?? false,
      username: input.username,
      ...(encrypted
        ? {
            passwordCipher: encrypted.cipher,
            passwordIv: encrypted.iv,
            passwordTag: encrypted.tag
          }
        : {}),
      fromName: input.fromName,
      fromEmail: input.fromEmail
    }
  });
}

async function getTransport() {
  const settings = await prisma.smtpSettings.findUnique({ where: { id: "default" } });
  if (!settings?.host || !settings.fromEmail) {
    throw new Error("SMTP settings are incomplete.");
  }

  const pass =
    settings.passwordCipher && settings.passwordIv && settings.passwordTag
      ? decryptSecret({
          cipher: settings.passwordCipher,
          iv: settings.passwordIv,
          tag: settings.passwordTag
        })
      : undefined;

  return {
    settings,
    transport: nodemailer.createTransport({
      host: settings.host,
      port: settings.port,
      secure: settings.secure,
      auth: settings.username ? { user: settings.username, pass } : undefined
    })
  };
}

export async function sendTestEmail(to: string) {
  const { settings, transport } = await getTransport();
  await transport.sendMail({
    from: { name: settings.fromName ?? "Microtec License Manager", address: settings.fromEmail ?? "" },
    to,
    subject: "Microtec License Manager test email",
    text: "SMTP settings are working."
  });
}

async function resolveRecipients(licenseId: string) {
  const targets = await prisma.licenseNotificationTarget.findMany({
    where: { licenseId },
    include: {
      recipient: true,
      group: { include: { members: { include: { recipient: true } } } }
    }
  });

  const recipients = new Map<string, string>();
  for (const target of targets) {
    if (target.recipient?.active) recipients.set(target.recipient.email, target.recipient.name);
    for (const member of target.group?.members ?? []) {
      if (member.recipient.active) recipients.set(member.recipient.email, member.recipient.name);
    }
  }
  return [...recipients.entries()].map(([email, name]) => ({ email, name }));
}

export async function sendLicenseNotification(licenseId: string, kind: NotificationKind) {
  const licenseRecord = await prisma.license.findUnique({
    where: { id: licenseId },
    include: { encryptedData: true, adminAssignments: { include: { admin: true } } }
  });
  if (!licenseRecord) throw new Error("License not found.");

  const license = decryptLicense(licenseRecord);
  const recipients = await resolveRecipients(license.id);
  if (recipients.length === 0) return { sent: 0, failed: 0 };

  const { settings, transport } = await getTransport();
  const subject =
    kind === "expiry_reminder"
      ? `License renewal reminder: ${license.details}`
      : `License notification: ${license.details}`;
  const text = [
    `License: ${license.details}`,
    `Status: ${license.status ?? "Not set"}`,
    `Service type: ${license.serviceType ?? "Not set"}`,
    `Branch: ${license.branch ?? "Not set"}`,
    `Vendor: ${license.vendor ?? "Not set"}`,
    `Expiry date: ${license.expiryDate?.toISOString().slice(0, 10) ?? "Not set"}`
  ].join("\n");

  let sent = 0;
  let failed = 0;
  for (const recipient of recipients) {
    try {
      await transport.sendMail({
        from: { name: settings.fromName ?? "Microtec License Manager", address: settings.fromEmail ?? "" },
        to: { name: recipient.name, address: recipient.email },
        subject,
        text
      });
      sent += 1;
      await prisma.notificationHistory.create({
        data: { licenseId: license.id, kind, status: "sent", recipient: recipient.email, subject, sentAt: new Date() }
      });
    } catch (error) {
      failed += 1;
      await prisma.notificationHistory.create({
        data: {
          licenseId: license.id,
          kind,
          status: "failed",
          recipient: recipient.email,
          subject,
          errorMessage: error instanceof Error ? error.message : "Unknown SMTP error"
        }
      });
    }
  }

  return { sent, failed };
}
