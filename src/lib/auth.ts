import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Role, UserStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { getServerSession, type NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";

import { prisma } from "@/lib/prisma";

/**
 * Replaces authorization claims with the current stored values. Returning null
 * revokes protected access; database failures intentionally propagate instead
 * of falling back to cached JWT claims.
 */
export async function revalidateTokenAuthorization(
  token: JWT,
): Promise<JWT | null> {
  if (!token.sub) return null;

  const user = await prisma.user.findUnique({
    where: { id: token.sub },
    select: { id: true, role: true, status: true },
  });
  if (!user || user.status !== "active") return null;

  return {
    ...token,
    sub: user.id,
    role: user.role,
    status: user.status,
  };
}

function revokeTokenAuthorization(token: JWT): JWT {
  return {
    ...token,
    sub: undefined,
    role: undefined,
    status: "disabled",
  };
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim();
        const password = credentials?.password;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash || user.status !== "active") return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: Role }).role;
        token.status = (user as { status?: UserStatus }).status;
        return token;
      }

      return (
        (await revalidateTokenAuthorization(token)) ??
        revokeTokenAuthorization(token)
      );
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = token.role ?? "viewer";
        session.user.status = token.status ?? "disabled";
      }
      return session;
    },
  },
};

/** The only session shape trusted by protected API and app-rendering guards. */
export async function getProtectedSession() {
  const session = await getServerSession(authOptions);
  if (
    !session?.user?.id ||
    session.user.status !== "active" ||
    !session.user.role
  ) {
    return null;
  }
  return session;
}
