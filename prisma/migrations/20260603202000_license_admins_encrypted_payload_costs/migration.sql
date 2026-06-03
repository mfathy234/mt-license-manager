-- License admin entities and encrypted license payloads.
CREATE TABLE "LicenseEncryptedData" (
    "id" TEXT NOT NULL,
    "licenseId" TEXT NOT NULL,
    "cipher" TEXT NOT NULL,
    "iv" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LicenseEncryptedData_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LicenseAdmin" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LicenseAdmin_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LicenseAdminAssignment" (
    "id" TEXT NOT NULL,
    "licenseId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    CONSTRAINT "LicenseAdminAssignment_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "License" ALTER COLUMN "details" DROP NOT NULL;
ALTER TABLE "License" ADD COLUMN "monthlyCostEgp" DECIMAL(12,2);
ALTER TABLE "License" ADD COLUMN "yearlyCostEgp" DECIMAL(12,2);
ALTER TABLE "License" ADD COLUMN "fiveYearsCostEgp" DECIMAL(12,2);
ALTER TABLE "License" ADD COLUMN "monthlyCostUsd" DECIMAL(12,2);
ALTER TABLE "License" ADD COLUMN "yearlyCostUsd" DECIMAL(12,2);
ALTER TABLE "License" ADD COLUMN "fiveYearsCostUsd" DECIMAL(12,2);

CREATE UNIQUE INDEX "LicenseEncryptedData_licenseId_key" ON "LicenseEncryptedData"("licenseId");
CREATE UNIQUE INDEX "LicenseAdmin_name_key" ON "LicenseAdmin"("name");
CREATE UNIQUE INDEX "LicenseAdminAssignment_licenseId_adminId_key" ON "LicenseAdminAssignment"("licenseId", "adminId");

ALTER TABLE "LicenseEncryptedData" ADD CONSTRAINT "LicenseEncryptedData_licenseId_fkey" FOREIGN KEY ("licenseId") REFERENCES "License"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LicenseAdminAssignment" ADD CONSTRAINT "LicenseAdminAssignment_licenseId_fkey" FOREIGN KEY ("licenseId") REFERENCES "License"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LicenseAdminAssignment" ADD CONSTRAINT "LicenseAdminAssignment_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "LicenseAdmin"("id") ON DELETE CASCADE ON UPDATE CASCADE;
