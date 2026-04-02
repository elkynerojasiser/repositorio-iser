import { FormEvent, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { safePathAfterAuth } from '../utils/authRedirect';
import styles from './Pages.module.css';

export function LoginPage() {
  const { login, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    clearError();
    try {
      await login(email, password);
      navigate(safePathAfterAuth(location.state), { replace: true });
    } catch {
      /* error en contexto */
    }
  }

  return (
    <div className={styles.authBox}>
      <h1 className={styles.pageTitle}>Iniciar sesión</h1>
      <p className={styles.lead}>
        Accede con tu cuenta. ¿No tienes una?{' '}
        <Link to="/registro">Regístrate</Link>
      </p>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label className={styles.field}>
          <span>Correo</span>
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className={styles.field}>
          <span>Contraseña</span>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && <p className={styles.error}>{error}</p>}
        <button type="submit" className={styles.primary} disabled={loading}>
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
