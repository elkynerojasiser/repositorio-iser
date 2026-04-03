import { Link, Outlet } from 'react-router-dom';
import logoIser from '../assets/logo_iser.png';
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
            <img
              src={logoIser}
              alt="Instituto Superior de Educación Rural"
              className={styles.brandLogo}
            />
            <span className={styles.brandText}>
              <span>Repositorio de grado</span>
              <span className={styles.brandAccent}>ISER</span>
            </span>
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
        <p>Instituto Superior de Educación Rural — Repositorio de trabajos de grado</p>
        <p>
          <a href="https://www.iser.edu.co/" target="_blank" rel="noopener noreferrer">
            www.iser.edu.co
          </a>
        </p>
      </footer>
    </div>
  );
}
