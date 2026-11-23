import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  MONGODB_URI: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url().transform(value => value.replace(/\/$/, '')),
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  // No imprimir valores: pueden contener credenciales.
  throw new Error(`Configuración inválida: ${parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ')}. Revisá backend/.env.example.`);
}
export const env = parsed.data;
