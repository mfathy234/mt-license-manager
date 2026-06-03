import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { AppShellClient } from "@/components/app-shell-client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const userCount = await prisma.user.count();
  if (userCount === 0) redirect("/setup");

  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  return <AppShellClient user={session.user}>{children}</AppShellClient>;
}
