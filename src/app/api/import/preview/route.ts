import { NextResponse } from "next/server";

import { requireSession } from "@/lib/api";
import { parseLicenseWorkbook, parseLookupWorkbook } from "@/lib/excel";

export async function POST(request: Request) {
  const auth = await requireSession("import:write");
  if ("error" in auth) return auth.error;

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Workbook file is required." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const rows = parseLicenseWorkbook(buffer);
  const lookups = parseLookupWorkbook(buffer);
  return NextResponse.json({ filename: file.name, rowCount: rows.length, rows, lookups });
}
