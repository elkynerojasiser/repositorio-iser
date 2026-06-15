import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Exige usuario y token. Las rutas hijas solo se renderizan si hay sesión.
 */
export function RequireAuth() {
  const { token, user } = useAuth();
  const location = useLocation();

  if (!token || !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  return <Outlet />;
}
