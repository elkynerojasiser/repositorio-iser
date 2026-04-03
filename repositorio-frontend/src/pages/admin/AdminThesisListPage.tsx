import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteThesisStaff, listThesesStaff } from '../../api/thesisAdmin';
import type { ThesisStaffDetail } from '../../api/types';
import { useAuth } from '../../context/AuthContext';
import styles from '../Pages.module.css';
import listStyles from './AdminThesisListPage.module.css';

export function AdminThesisListPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<ThesisStaffDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await listThesesStaff(token);
      setItems(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar el listado.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleDelete(id: number, title: string) {
    if (!token) return;
    const ok = window.confirm(
      `¿Eliminar el trabajo «${title}»? Se borrará también el archivo PDF. Esta acción no se puede deshacer.`
    );
    if (!ok) return;
    setDeletingId(id);
    setError(null);
    try {
      await deleteThesisStaff(token, id);
      setItems((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo eliminar.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <h1 className={styles.pageTitle}>Trabajos de grado</h1>
      <p className={styles.lead}>
        Visualiza, edita o elimina registros. El catálogo público refleja estos cambios.
      </p>
      <p>
        <Link to="/admin/tesis/nueva" className={styles.primaryLink}>
          + Nuevo trabajo
        </Link>
      </p>

      {loading && <p className={styles.muted}>Cargando…</p>}
      {error && <p className={styles.error}>{error}</p>}

      {!loading && !error && items.length === 0 && (
        <p className={styles.muted}>No hay trabajos registrados. Crea el primero.</p>
      )}

      {!loading && items.length > 0 && (
        <div className={listStyles.tableWrap}>
          <table className={listStyles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Título</th>
                <th>Autor</th>
                <th>Año</th>
                <th>Programa</th>
                <th>Tipo</th>
                <th>Palabras</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id}>
                  <td>{t.id}</td>
                  <td className={listStyles.titleCell}>{t.title}</td>
                  <td>{t.author}</td>
                  <td>{t.year}</td>
                  <td>{t.program?.name ?? '—'}</td>
                  <td>{t.type?.name ?? '—'}</td>
                  <td>{t.keywords?.length ?? 0}</td>
                  <td>
                    <div className={listStyles.actions}>
                      <Link to={`/tesis/${t.id}`} target="_blank" rel="noopener noreferrer">
                        Ver público
                      </Link>
                      <Link to={`/admin/tesis/${t.id}/editar`}>Editar</Link>
                      <button
                        type="button"
                        className={listStyles.dangerBtn}
                        disabled={deletingId === t.id}
                        onClick={() => handleDelete(t.id, t.title)}
                      >
                        {deletingId === t.id ? '…' : 'Eliminar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
