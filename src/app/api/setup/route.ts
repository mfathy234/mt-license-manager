import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const setupSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
  password: z.string().min(10)
});

export async function POST(request: Request) {
  const existingUsers = await prisma.user.count();
  if (existingUsers > 0) {
    return NextResponse.json({ error: "Setup has already been completed." }, { status: 409 });
  }

  const input = setupSchema.parse(await request.json());
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email.toLowerCase(),
      passwordHash: await bcrypt.hash(input.password, 12),
      role: "admin",
      status: "active"
    },
    select: { id: true, email: true }
  });

  await prisma.reminderConfig.createMany({
    data: [
      { daysBefore: 30, sendHour: 9 },
      { daysBefore: 14, sendHour: 9 },
      { daysBefore: 7, sendHour: 9 },
      { daysBefore: 1, sendHour: 9 }
    ],
    skipDuplicates: true
  });

  return NextResponse.json({ user });
}
