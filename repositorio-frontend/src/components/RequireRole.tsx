import type { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type Props = {
  roles: readonly string[];
  children: ReactElement;
};

export function RequireRole({ roles, children }: Props) {
  const { user, token } = useAuth();
  const role = user?.role?.name;

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: 'protected' }} />;
  }
  if (!role || !roles.includes(role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}
