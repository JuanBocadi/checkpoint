import { z } from "zod";
import { auth } from "../lib/auth.js";
import { client, connectDatabase, db } from "../config/db.js";
import { initialGames } from "../data/games.js";

const seedConfig = z
  .object({
    SEED_ADMIN_EMAIL: z.email(),
    SEED_ADMIN_PASSWORD: z.string().min(8).max(128),
    SEED_USER_EMAIL: z.email(),
    SEED_USER_PASSWORD: z.string().min(8).max(128),
  })
  .refine(
    (v) => v.SEED_ADMIN_EMAIL !== v.SEED_USER_EMAIL,
    "Los emails deben ser diferentes.",
  )
  .parse(process.env);

try {
  await connectDatabase();
  for (const account of [
    {
      email: seedConfig.SEED_ADMIN_EMAIL,
      password: seedConfig.SEED_ADMIN_PASSWORD,
      name: "Admin Checkpoint",
      role: "admin" as const,
    },
    {
      email: seedConfig.SEED_USER_EMAIL,
      password: seedConfig.SEED_USER_PASSWORD,
      name: "Jugador Checkpoint",
      role: "user" as const,
    },
  ]) {
    const existing = await db
      .collection("user")
      .findOne({ email: account.email });
    if (existing) {
      // No cambiar contraseñas/roles de cuentas existentes silenciosamente.
      if (existing.role !== account.role)
        throw new Error(`La cuenta ${account.email} ya existe con otro rol.`);
      console.log(`Cuenta existente conservada: ${account.email}`);
    } else {
      await auth.api.createUser({ body: account });
      console.log(`Cuenta ${account.role} creada: ${account.email}`);
    }
  }
  const now = new Date();
  for (const game of initialGames) {
    await db
      .collection("games")
      .updateOne(
        { title: game.title },
        {
          $setOnInsert: {
            ...game,
            releaseDate: new Date(game.releaseDate),
            createdAt: now,
            updatedAt: now,
          },
        },
        { upsert: true },
      );
  }
  console.log("Datos iniciales listos. Las contraseñas no se imprimen.");
} catch (error) {
  console.error(
    "Falló la carga inicial:",
    error instanceof Error ? error.message : "Error desconocido",
  );
  process.exitCode = 1;
} finally {
  await client.close();
}
