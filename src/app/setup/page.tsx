import { redirect } from "next/navigation";

import { SetupForm } from "@/components/setup-form";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const userCount = await prisma.user.count();
  if (userCount > 0) redirect("/login");

  return (
    <main className="flex min-h-screen items-center justify-center p-5">
      <SetupForm />
    </main>
  );
}
