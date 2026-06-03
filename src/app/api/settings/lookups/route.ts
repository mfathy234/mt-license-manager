import { NextResponse } from "next/server";
import { z } from "zod";

import { requireSession } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  values: z.array(
    z.object({
      id: z.string().optional(),
      category: z.string().trim().min(1),
      value: z.string().trim().min(1),
      sortOrder: z.number().int().default(0),
      active: z.boolean().default(true)
    })
  )
});

export async function GET() {
  const auth = await requireSession("license:read");
  if ("error" in auth) return auth.error;
  const values = await prisma.lookupValue.findMany({ orderBy: [{ category: "asc" }, { sortOrder: "asc" }] });
  return NextResponse.json({ values });
}

export async function PUT(request: Request) {
  const auth = await requireSession("settings:write");
  if ("error" in auth) return auth.error;
  const { values } = schema.parse(await request.json());
  await prisma.$transaction(
    values.map((value) =>
      prisma.lookupValue.upsert({
        where: { category_value: { category: value.category, value: value.value } },
        create: value,
        update: { sortOrder: value.sortOrder, active: value.active }
      })
    )
  );
  return NextResponse.json({ ok: true });
}
