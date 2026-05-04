import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

/**
 * PrivateRoute — protège une route côté client.
 * @param {string} [requiredRole] - 'admin' pour restreindre aux admins uniquement
 * @param {string} [redirectTo] - URL de redirection si non connecté (défaut: /login)
 */
export default function PrivateRoute({ children, requiredRole = null, redirectTo = '/login' }) {
  const { isAuthenticated, user, userLoading, fetchUser } = useAuthStore();
  const location = useLocation();

  // Si on a un token mais que le user n'est pas encore chargé,
  // déclenche fetchUser (cas du refresh de page)
  useEffect(() => {
    if (isAuthenticated && !user && !userLoading) {
      fetchUser();
    }
  }, [isAuthenticated, user, userLoading, fetchUser]);

  // Pas authentifié → redirect vers login avec le path actuel en state
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />;
  }

  // En attente de résolution du user (refresh de page ou fetchUser en cours)
  if (userLoading || (isAuthenticated && !user)) {
    return (
      <div style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p className="label">Loading...</p>
      </div>
    );
  }

  // Rôle requis → si l'utilisateur n'a pas le bon rôle, redirect home
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}
