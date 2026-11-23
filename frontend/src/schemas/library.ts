import { z } from "zod";
import type { Game } from "./game";

export const statuses = [
  "Pendiente",
  "Jugando",
  "Completado",
  "En pausa",
  "Abandonado",
] as const;
export const librarySchema = z.object({
  status: z.enum(statuses),
  hoursPlayed: z
    .number()
    .finite()
    .min(0, "Las horas no pueden ser negativas.")
    .max(100000),
  rating: z.number().int().min(1).max(10).nullable(),
  notes: z.string().trim().max(2000, "Máximo 2000 caracteres."),
  favorite: z.boolean(),
});
export type LibraryInput = z.infer<typeof librarySchema>;
export interface LibraryEntry extends LibraryInput {
  _id: string;
  ownerId: string;
  gameId: string;
  game: Game | null;
  createdAt: string;
  updatedAt: string;
}
export interface LibraryList {
  data: LibraryEntry[];
  pagination: { page: number; limit: number; total: number; pages: number };
}
