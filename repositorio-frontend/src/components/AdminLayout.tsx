import { NavLink, Outlet } from 'react-router-dom';
import styles from './AdminLayout.module.css';

export function AdminLayout() {
  return (
    <div className={styles.wrap}>
      <aside className={styles.sidebar} aria-label="Navegación de administración">
        <h2 className={styles.sidebarTitle}>Administración</h2>
        <p className={styles.sidebarHint}>
          Gestión de trabajos de grado y criterios de clasificación. Solo administradores.
        </p>
        <nav className={styles.nav}>
          <NavLink
            to="/admin/tesis"
            end
            className={({ isActive }) => (isActive ? styles.navLinkActive : styles.navLink)}
          >
            Trabajos de grado
          </NavLink>
          <NavLink
            to="/admin/tesis/nueva"
            className={({ isActive }) => (isActive ? styles.navLinkActive : styles.navLink)}
          >
            Nuevo trabajo
          </NavLink>
          <NavLink
            to="/admin/clasificacion"
            className={({ isActive }) => (isActive ? styles.navLinkActive : styles.navLink)}
          >
            Criterios de clasificación
          </NavLink>
        </nav>
      </aside>
      <div className={styles.main}>
        <Outlet />
      </div>
    </div>
  );
}
