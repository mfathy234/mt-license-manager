-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'editor', 'viewer');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'invited', 'disabled');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('license_create', 'license_update', 'license_delete', 'credential_create', 'credential_reveal', 'credential_update', 'import_confirm', 'notification_send', 'settings_update', 'user_update');

-- CreateEnum
CREATE TYPE "NotificationKind" AS ENUM ('created', 'manual', 'expiry_reminder');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('pending', 'sent', 'failed');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "passwordHash" TEXT,
    "role" "Role" NOT NULL DEFAULT 'viewer',
    "status" "UserStatus" NOT NULL DEFAULT 'invited',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "License" (
    "id" TEXT NOT NULL,
    "status" TEXT,
    "serviceType" TEXT,
    "details" TEXT NOT NULL,
    "branch" TEXT,
    "vendor" TEXT,
    "usersCount" INTEGER,
    "ownerAccount" TEXT,
    "admins" TEXT,
    "startDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "paymentMethod" TEXT,
    "renewalFrequency" TEXT,
    "costEgp" DECIMAL(12,2),
    "costUsd" DECIMAL(12,2),
    "notes" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "License_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CredentialSecret" (
    "id" TEXT NOT NULL,
    "licenseId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "usernameCipher" TEXT,
    "usernameIv" TEXT,
    "usernameTag" TEXT,
    "passwordCipher" TEXT NOT NULL,
    "passwordIv" TEXT NOT NULL,
    "passwordTag" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CredentialSecret_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LookupValue" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LookupValue_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EmailRecipient" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "EmailRecipient_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EmailGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "EmailGroup_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EmailGroupMember" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    CONSTRAINT "EmailGroupMember_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LicenseNotificationTarget" (
    "id" TEXT NOT NULL,
    "licenseId" TEXT NOT NULL,
    "recipientId" TEXT,
    "groupId" TEXT,
    CONSTRAINT "LicenseNotificationTarget_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ReminderConfig" (
    "id" TEXT NOT NULL,
    "daysBefore" INTEGER NOT NULL,
    "sendHour" INTEGER NOT NULL DEFAULT 9,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ReminderConfig_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "NotificationHistory" (
    "id" TEXT NOT NULL,
    "licenseId" TEXT NOT NULL,
    "kind" "NotificationKind" NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'pending',
    "recipient" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "errorMessage" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "NotificationHistory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InAppNotification" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InAppNotification_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" "AuditAction" NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SmtpSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "host" TEXT,
    "port" INTEGER NOT NULL DEFAULT 587,
    "secure" BOOLEAN NOT NULL DEFAULT false,
    "username" TEXT,
    "passwordCipher" TEXT,
    "passwordIv" TEXT,
    "passwordTag" TEXT,
    "fromName" TEXT,
    "fromEmail" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SmtpSettings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ImportBatch" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "rowCount" INTEGER NOT NULL,
    "rawRows" JSONB NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ImportBatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");
CREATE UNIQUE INDEX "LookupValue_category_value_key" ON "LookupValue"("category", "value");
CREATE UNIQUE INDEX "EmailRecipient_email_key" ON "EmailRecipient"("email");
CREATE UNIQUE INDEX "EmailGroup_name_key" ON "EmailGroup"("name");
CREATE UNIQUE INDEX "EmailGroupMember_groupId_recipientId_key" ON "EmailGroupMember"("groupId", "recipientId");
CREATE UNIQUE INDEX "LicenseNotificationTarget_licenseId_recipientId_key" ON "LicenseNotificationTarget"("licenseId", "recipientId");
CREATE UNIQUE INDEX "LicenseNotificationTarget_licenseId_groupId_key" ON "LicenseNotificationTarget"("licenseId", "groupId");
CREATE UNIQUE INDEX "ReminderConfig_daysBefore_key" ON "ReminderConfig"("daysBefore");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "License" ADD CONSTRAINT "License_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CredentialSecret" ADD CONSTRAINT "CredentialSecret_licenseId_fkey" FOREIGN KEY ("licenseId") REFERENCES "License"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EmailGroupMember" ADD CONSTRAINT "EmailGroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "EmailGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EmailGroupMember" ADD CONSTRAINT "EmailGroupMember_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "EmailRecipient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LicenseNotificationTarget" ADD CONSTRAINT "LicenseNotificationTarget_licenseId_fkey" FOREIGN KEY ("licenseId") REFERENCES "License"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LicenseNotificationTarget" ADD CONSTRAINT "LicenseNotificationTarget_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "EmailRecipient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LicenseNotificationTarget" ADD CONSTRAINT "LicenseNotificationTarget_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "EmailGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NotificationHistory" ADD CONSTRAINT "NotificationHistory_licenseId_fkey" FOREIGN KEY ("licenseId") REFERENCES "License"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
