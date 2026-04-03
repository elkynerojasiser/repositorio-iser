import { FormEvent, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { safePathAfterAuth } from '../utils/authRedirect';
import styles from './Pages.module.css';

export function RegisterPage() {
  const { register, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    clearError();
    try {
      await register(name, email, password);
      navigate(safePathAfterAuth(location.state), { replace: true });
    } catch {
      /* error en contexto */
    }
  }

  return (
    <div className={styles.authBox}>
      <h1 className={styles.pageTitle}>Crear cuenta</h1>
      <p className={styles.lead}>
        Registro con rol público. ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label className={styles.field}>
          <span>Nombre</span>
          <input
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className={styles.field}>
          <span>Correo</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className={styles.field}>
          <span>Contraseña (mín. 8 caracteres)</span>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && <p className={styles.error}>{error}</p>}
        <button type="submit" className={styles.primary} disabled={loading}>
          {loading ? 'Creando…' : 'Registrarse'}
        </button>
      </form>
    </div>
  );
}
