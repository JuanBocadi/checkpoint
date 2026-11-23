import { z } from "zod";

export const genres = [
  "Acción",
  "Aventura",
  "RPG",
  "Estrategia",
  "Deportes",
  "Indie",
] as const;
export const platforms = [
  "PC",
  "PlayStation",
  "Xbox",
  "Nintendo Switch",
  "Multiplataforma",
] as const;
export const gameSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Ingresá al menos 2 caracteres.")
    .max(100, "Máximo 100 caracteres."),
  description: z
    .string()
    .trim()
    .min(20, "Escribí al menos 20 caracteres.")
    .max(3000, "Máximo 3000 caracteres."),
  genre: z.enum(genres, { error: "Elegí un género." }),
  platform: z.enum(platforms, { error: "Elegí una plataforma." }),
  releaseDate: z.iso.date({ error: "Ingresá una fecha válida." }),
  price: z
    .number({ error: "Ingresá un precio válido." })
    .min(0, "El precio no puede ser negativo.")
    .max(1000, "El máximo es USD 1000."),
  multiplayer: z.boolean(),
});
export type GameInput = z.infer<typeof gameSchema>;
export interface Game extends Omit<GameInput, "releaseDate"> {
  _id: string;
  releaseDate: string;
  createdAt: string;
  updatedAt: string;
}
export interface GameList {
  data: Game[];
  pagination: { page: number; limit: number; total: number; pages: number };
}
