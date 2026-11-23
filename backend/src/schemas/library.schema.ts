import { z } from "zod";

export const libraryStatuses = [
  "Pendiente",
  "Jugando",
  "Completado",
  "En pausa",
  "Abandonado",
] as const;
export const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "El identificador no es válido.");
export const libraryFieldsSchema = z.object({
  status: z.enum(libraryStatuses),
  hoursPlayed: z.number().finite().min(0).max(100000),
  rating: z.number().int().min(1).max(10).nullable(),
  notes: z.string().trim().max(2000),
  favorite: z.boolean(),
});
export const createLibrarySchema = libraryFieldsSchema
  .extend({ gameId: objectIdSchema })
  .strict();
export const updateLibrarySchema = libraryFieldsSchema
  .partial()
  .strict()
  .refine(
    (value) => Object.keys(value).length > 0,
    "Enviá al menos un campo para editar.",
  );
export const libraryQuerySchema = z.object({
  scope: z.enum(["mine", "all"]).default("mine"),
  status: z.enum(libraryStatuses).optional(),
  favorite: z.enum(["true", "false"]).optional(),
  gameId: objectIdSchema.optional(),
  page: z.coerce.number().int().min(1).max(100000).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});
export type LibraryFields = z.infer<typeof libraryFieldsSchema>;
