import { Navigate, Outlet, useLocation } from 'react-router';
import { useSession } from '../lib/auth-client';
import { Loading, Notice } from './Ui';

export function ProtectedRoute() {
  const { data: session, isPending, error } = useSession();
  const location = useLocation();
  if (isPending) return <div className="container section"><Loading /></div>;
  if (error) return <div className="container section"><Notice error>No pudimos verificar la sesión. Recargá la página para intentar otra vez.</Notice></div>;
  if (!session) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (session.user.role !== 'admin') return <div className="container section"><p className="eyebrow">Acceso restringido</p><h1>Sin permisos</h1><Notice error>Tu cuenta es de jugador. Solo los administradores pueden acceder a este panel.</Notice></div>;
  return <Outlet />;
}
