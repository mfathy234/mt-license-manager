import type { Role, UserStatus } from "@prisma/client";

declare module "next-auth" {
  interface User {
    role?: Role;
    status?: UserStatus;
  }

  interface Session {
    user: {
      id: string;
      role: Role;
      status: UserStatus;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role;
    status?: UserStatus;
  }
}
