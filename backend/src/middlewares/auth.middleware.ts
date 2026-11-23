import type { NextFunction, Request, Response } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../lib/auth.js';

declare global {
  namespace Express {
    interface Request { user?: { id: string; role?: string | null } }
  }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
  if (!session) {
    res.status(401).json({ error: { message: 'Iniciá sesión para continuar.' } });
    return;
  }
  req.user = session.user;
  next();
}

export function requireRole(role: 'admin') {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) { res.status(401).json({ error: { message: 'Sesión requerida.' } }); return; }
    if (req.user.role !== role) {
      res.status(403).json({ error: { message: 'Solo un administrador puede realizar esta acción.' } });
      return;
    }
    next();
  };
}
