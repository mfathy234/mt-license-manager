import { z } from "zod";

const nullableDate = z
  .string()
  .trim()
  .optional()
  .nullable()
  .transform((value) => (value ? new Date(value) : null));

const nullableNumber = z
  .union([z.string(), z.number()])
  .optional()
  .nullable()
  .transform((value) => {
    if (value === null || value === undefined || value === "") return null;
    const number = Number(value);
    return Number.isNaN(number) ? null : number;
  });

export const licenseSchema = z.object({
  status: z.string().trim().optional().nullable(),
  serviceType: z.string().trim().optional().nullable(),
  details: z.string().trim().min(1, "Details are required"),
  branch: z.string().trim().optional().nullable(),
  vendor: z.string().trim().optional().nullable(),
  usersCount: nullableNumber,
  ownerAccount: z.string().trim().optional().nullable(),
  adminIds: z.array(z.string()).optional(),
  startDate: nullableDate,
  expiryDate: nullableDate,
  paymentMethod: z.string().trim().optional().nullable(),
  renewalFrequency: z.string().trim().optional().nullable(),
  costEgp: nullableNumber,
  costUsd: nullableNumber,
  monthlyCostEgp: nullableNumber,
  yearlyCostEgp: nullableNumber,
  fiveYearsCostEgp: nullableNumber,
  monthlyCostUsd: nullableNumber,
  yearlyCostUsd: nullableNumber,
  fiveYearsCostUsd: nullableNumber,
  notes: z.string().trim().optional().nullable(),
  recipientIds: z.array(z.string()).optional(),
  groupIds: z.array(z.string()).optional()
});

export const recipientSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Enter a valid email address"),
  active: z.boolean().optional()
});

export const groupSchema = z.object({
  name: z.string().trim().min(1, "Group name is required"),
  active: z.boolean().optional(),
  recipientIds: z.array(z.string()).optional()
});
