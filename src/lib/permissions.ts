import type { Role } from "@prisma/client";

export type Action =
  | "license:read"
  | "license:write"
  | "license:delete"
  | "credential:read"
  | "credential:write"
  | "settings:write"
  | "users:write"
  | "import:write";

const grants: Record<Role, Action[]> = {
  admin: [
    "license:read",
    "license:write",
    "license:delete",
    "credential:read",
    "credential:write",
    "settings:write",
    "users:write",
    "import:write"
  ],
  editor: ["license:read", "license:write", "credential:read", "credential:write"],
  viewer: ["license:read"]
};

export function can(role: Role | undefined, action: Action) {
  if (!role) return false;
  return grants[role].includes(action);
}
