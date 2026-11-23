import { app } from "./app.js";
import { client, connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";

try {
  await connectDatabase();
  const server = app.listen(env.PORT, "0.0.0.0", () =>
    console.log(`Checkpoint API lista en el puerto ${env.PORT}`),
  );
  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.on(signal, () => {
      server.close(() => {
        void client.close().then(() => process.exit(0));
      });
    });
  }
} catch (error) {
  console.error(
    "No se pudo iniciar la API. Revisá la configuración y la conexión con MongoDB.",
    error instanceof Error ? error.name : "",
  );
  await client.close();
  process.exit(1);
}
