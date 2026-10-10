import { redirect } from "next/navigation";

import { AppShellClient } from "@/components/app-shell-client";
import { requirePageSession } from "@/lib/page-auth";
import { prisma } from "@/lib/prisma";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await requirePageSession();
  const userCount = await prisma.user.count();
  if (userCount === 0) redirect("/setup");

  return <AppShellClient user={session.user}>{children}</AppShellClient>;
}
