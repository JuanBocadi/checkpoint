import { z } from 'zod';

export const genres = ['Acción', 'Aventura', 'RPG', 'Estrategia', 'Deportes', 'Indie'] as const;
export const platforms = ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch', 'Multiplataforma'] as const;
export const gameSchema = z.object({
  title: z.string().trim().min(2, 'Ingresá al menos 2 caracteres.').max(100),
  description: z.string().trim().min(20, 'La descripción debe tener al menos 20 caracteres.').max(3000),
  genre: z.enum(genres, { error: 'Elegí un género válido.' }),
  platform: z.enum(platforms, { error: 'Elegí una plataforma válida.' }),
  releaseDate: z.iso.date({ error: 'Ingresá una fecha válida (AAAA-MM-DD).' }),
  price: z.number().finite().min(0, 'El precio no puede ser negativo.').max(1000),
  multiplayer: z.boolean(),
}).strict();

export const updateGameSchema = gameSchema.partial().refine(value => Object.keys(value).length > 0, 'Enviá al menos un campo para editar.');
export const gameQuerySchema = z.object({
  q: z.string().trim().max(100).default(''),
  genre: z.enum(genres).optional(),
  platform: z.enum(platforms).optional(),
  page: z.coerce.number().int().min(1).max(100000).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});
export type GameInput = z.infer<typeof gameSchema>;
