import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

// Mismo origen en local y producción: las cookies viajan por /api.
export const authClient = createAuthClient({ plugins: [adminClient()] });
export const { useSession } = authClient;
