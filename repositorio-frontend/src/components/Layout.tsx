import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { canAccessAdminPanel } from '../utils/roles';
import styles from './Layout.module.css';

export function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link to="/" className={styles.brand}>
            Repositorio de grado
          </Link>
          <nav className={styles.nav}>
            {user ? (
              <>
                <Link to="/">Catálogo</Link>
                <Link to="/asistente">Asistente IA</Link>
              </>
            ) : null}
            {user && canAccessAdminPanel(user.role?.name) && (
              <Link to="/admin">Panel administrativo</Link>
            )}
            {user ? (
              <>
                <span className={styles.user}>
                  {user.name}
                  {user.role?.name ? (
                    <span className={styles.role}> ({user.role.name})</span>
                  ) : null}
                </span>
                <button type="button" className={styles.linkBtn} onClick={logout}>
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link to="/login">Iniciar sesión</Link>
                <Link to="/registro" className={styles.cta}>
                  Registrarse
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
      <footer className={styles.footer}>
        <p>Plataforma de trabajos de grado — versión inicial</p>
      </footer>
    </div>
  );
}
