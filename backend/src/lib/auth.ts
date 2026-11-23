import { betterAuth } from 'better-auth';
import { admin } from 'better-auth/plugins';
import { mongodbAdapter } from '@better-auth/mongo-adapter';
import { client, db } from '../config/db.js';
import { env } from '../config/env.js';

// El origen público es el frontend: Vite/Render reenvían /api al backend.
export const auth = betterAuth({
  appName: 'Checkpoint',
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [env.BETTER_AUTH_URL],
  database: mongodbAdapter(db, { client }),
  emailAndPassword: { enabled: true, minPasswordLength: 8, maxPasswordLength: 128 },
  socialProviders: {
    github: { clientId: env.GITHUB_CLIENT_ID, clientSecret: env.GITHUB_CLIENT_SECRET },
    ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET ? {
      google: { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET },
    } : {}),
  },
  account: { accountLinking: { trustedProviders: ['github', 'google'] } },
  plugins: [admin({ defaultRole: 'user', adminRoles: ['admin'] })],
});
