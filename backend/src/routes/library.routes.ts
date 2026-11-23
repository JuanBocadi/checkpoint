import { Router } from "express";
import { ObjectId, type Filter } from "mongodb";
import { db } from "../config/db.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  createLibrarySchema,
  updateLibrarySchema,
  libraryQuerySchema,
  objectIdSchema,
  type LibraryFields,
} from "../schemas/library.schema.js";

export interface LibraryDocument extends LibraryFields {
  ownerId: string;
  gameId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
const entries = db.collection<LibraryDocument>("library_entries");
export const libraryRouter = Router();
libraryRouter.use(authMiddleware);

libraryRouter.get("/", async (req, res) => {
  const parsed = libraryQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({
      error: {
        message: "Filtros de biblioteca inválidos.",
        issues: parsed.error.issues.map((i) => ({
          field: i.path.join("."),
          message: i.message,
        })),
      },
    });
    return;
  }
  const { scope, status, favorite, gameId, page, limit } = parsed.data;
  if (scope === "all" && req.user!.role !== "admin") {
    res.status(403).json({
      error: {
        message: "Solo un administrador puede consultar todas las bibliotecas.",
      },
    });
    return;
  }
  const filter: Filter<LibraryDocument> =
    scope === "all" ? {} : { ownerId: req.user!.id };
  if (status) filter.status = status;
  if (favorite) filter.favorite = favorite === "true";
  if (gameId) filter.gameId = new ObjectId(gameId);
  const [data, total] = await Promise.all([
    entries
      .aggregate([
        { $match: filter },
        { $sort: { updatedAt: -1, _id: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit },
        {
          $lookup: {
            from: "games",
            localField: "gameId",
            foreignField: "_id",
            as: "game",
          },
        },
        { $unwind: { path: "$game", preserveNullAndEmptyArrays: true } },
        ...(scope === "all"
          ? [
              {
                $lookup: {
                  from: "user",
                  let: { ownerId: "$ownerId" },
                  pipeline: [
                    {
                      $match: {
                        $expr: { $eq: [{ $toString: "$_id" }, "$$ownerId"] },
                      },
                    },
                    { $project: { _id: 0, name: 1 } },
                  ],
                  as: "owner",
                },
              },
              {
                $set: {
                  ownerName: {
                    $ifNull: [
                      { $arrayElemAt: ["$owner.name", 0] },
                      "Cuenta eliminada",
                    ],
                  },
                },
              },
              { $unset: "owner" },
            ]
          : []),
      ])
      .toArray(),
    entries.countDocuments(filter),
  ]);
  res.json({
    data,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

libraryRouter.post("/", async (req, res) => {
  const parsed = createLibrarySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: {
        message: "Revisá los datos de tu biblioteca.",
        issues: parsed.error.issues.map((i) => ({
          field: i.path.join("."),
          message: i.message,
        })),
      },
    });
    return;
  }
  const gameId = new ObjectId(parsed.data.gameId);
  if (!(await db.collection("games").findOne({ _id: gameId }))) {
    res.status(404).json({ error: { message: "El videojuego no existe." } });
    return;
  }
  const now = new Date();
  const doc = {
    ...parsed.data,
    gameId,
    ownerId: req.user!.id,
    createdAt: now,
    updatedAt: now,
  };
  try {
    const result = await entries.insertOne(doc);
    res
      .status(201)
      .location(`/api/library/${result.insertedId}`)
      .json({ data: { ...doc, _id: result.insertedId } });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === 11000
    ) {
      res
        .status(409)
        .json({ error: { message: "Ese juego ya está en tu biblioteca." } });
      return;
    }
    throw error;
  }
});

libraryRouter.param("id", (_req, res, next, id: string) => {
  if (!objectIdSchema.safeParse(id).success) {
    res.status(400).json({
      error: { message: "El identificador del registro no es válido." },
    });
    return;
  }
  next();
});
function visibleFilter(
  id: string,
  user: { id: string; role?: string | null },
): Filter<LibraryDocument> {
  return {
    _id: new ObjectId(id),
    ...(user.role === "admin" ? {} : { ownerId: user.id }),
  };
}
libraryRouter.get("/:id", async (req, res) => {
  const entry = await entries.findOne(
    visibleFilter(req.params.id as string, req.user!),
  );
  if (!entry) {
    res.status(404).json({
      error: { message: "No encontramos ese registro en tu biblioteca." },
    });
    return;
  }
  const game = await db.collection("games").findOne({ _id: entry.gameId });
  res.json({ data: { ...entry, game } });
});
libraryRouter.patch("/:id", async (req, res) => {
  const parsed = updateLibrarySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: {
        message: "Revisá los cambios enviados.",
        issues: parsed.error.issues.map((i) => ({
          field: i.path.join("."),
          message: i.message,
        })),
      },
    });
    return;
  }
  const entry = await entries.findOneAndUpdate(
    visibleFilter(req.params.id as string, req.user!),
    { $set: { ...parsed.data, updatedAt: new Date() } },
    { returnDocument: "after" },
  );
  if (!entry) {
    res.status(404).json({
      error: { message: "No encontramos ese registro en tu biblioteca." },
    });
    return;
  }
  res.json({ data: entry });
});
libraryRouter.delete("/:id", async (req, res) => {
  const result = await entries.deleteOne(
    visibleFilter(req.params.id as string, req.user!),
  );
  if (!result.deletedCount) {
    res.status(404).json({
      error: { message: "No encontramos ese registro en tu biblioteca." },
    });
    return;
  }
  res.status(204).end();
});
