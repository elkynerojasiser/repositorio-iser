import { FormEvent, useCallback, useEffect, useId, useState } from 'react';
import type { ClassificationRef } from '../api/types';
import styles from './ClassificationEntitySection.module.css';

export type ClassificationSectionApi = {
  load: (token: string) => Promise<ClassificationRef[]>;
  create: (token: string, name: string) => Promise<ClassificationRef>;
  update: (token: string, id: number, name: string) => Promise<ClassificationRef>;
  remove: (token: string, id: number) => Promise<void>;
};

type Props = {
  title: string;
  hint?: string;
  token: string;
  api: ClassificationSectionApi;
};

export function ClassificationEntitySection({ title, hint, token, api }: Props) {
  const headingId = useId();
  const [items, setItems] = useState<ClassificationRef[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [savingId, setSavingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await api.load(token);
      setItems(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar la lista.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [api, token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    setError(null);
    try {
      await api.create(token, name);
      setNewName('');
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el registro.');
    } finally {
      setCreating(false);
    }
  }

  function startEdit(row: ClassificationRef) {
    setEditingId(row.id);
    setEditName(row.name);
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName('');
  }

  async function saveEdit() {
    if (editingId == null) return;
    const name = editName.trim();
    if (!name) return;
    setSavingId(editingId);
    setError(null);
    try {
      await api.update(token, editingId, name);
      cancelEdit();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar.');
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(row: ClassificationRef) {
    const ok = window.confirm(
      `¿Eliminar «${row.name}»? Si hay tesis vinculadas, la operación puede fallar por restricciones de la base de datos.`
    );
    if (!ok) return;
    setDeletingId(row.id);
    setError(null);
    try {
      await api.remove(token, row.id);
      if (editingId === row.id) cancelEdit();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.title}>
        {title}
      </h2>
      {hint ? <p className={styles.hint}>{hint}</p> : null}

      <form className={styles.addRow} onSubmit={handleCreate}>
        <label className={styles.addLabel}>
          <span className={styles.srOnly}>Nombre nuevo</span>
          <input
            className={styles.input}
            placeholder="Nombre para crear…"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            disabled={creating || loading}
          />
        </label>
        <button type="submit" className={styles.btnPrimary} disabled={creating || loading || !newName.trim()}>
          {creating ? 'Añadiendo…' : 'Añadir'}
        </button>
      </form>

      {error && <p className={styles.error}>{error}</p>}
      {loading && <p className={styles.muted}>Cargando…</p>}

      {!loading && items.length === 0 && !error && (
        <p className={styles.muted}>No hay registros. Añade el primero arriba.</p>
      )}

      {!loading && items.length > 0 && (
        <ul className={styles.list}>
          {items.map((row) => (
            <li key={row.id} className={styles.item}>
              {editingId === row.id ? (
                <div className={styles.editRow}>
                  <input
                    className={styles.input}
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    disabled={savingId === row.id}
                    aria-label="Editar nombre"
                  />
                  <div className={styles.itemActions}>
                    <button
                      type="button"
                      className={styles.btnPrimary}
                      onClick={() => void saveEdit()}
                      disabled={savingId === row.id || !editName.trim()}
                    >
                      {savingId === row.id ? '…' : 'Guardar'}
                    </button>
                    <button
                      type="button"
                      className={styles.btnGhost}
                      onClick={cancelEdit}
                      disabled={savingId === row.id}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className={styles.viewRow}>
                  <span className={styles.id}>#{row.id}</span>
                  <span className={styles.name}>{row.name}</span>
                  <div className={styles.itemActions}>
                    <button
                      type="button"
                      className={styles.btnGhost}
                      onClick={() => startEdit(row)}
                      disabled={deletingId === row.id}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className={styles.btnDanger}
                      onClick={() => void handleDelete(row)}
                      disabled={deletingId === row.id}
                    >
                      {deletingId === row.id ? '…' : 'Eliminar'}
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
