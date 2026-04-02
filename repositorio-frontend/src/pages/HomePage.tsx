import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchThesisList, type ThesisSearchParams } from '../api/thesis';
import type { ThesisListItem } from '../api/types';
import styles from './Pages.module.css';

const emptySearch: ThesisSearchParams = {
  q: '',
  title: '',
  author: '',
  keyword_name: '',
  year: '',
  program_id: '',
  type_id: '',
  research_line_id: '',
  keyword_id: '',
};

export function HomePage() {
  const [items, setItems] = useState<ThesisListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [filters, setFilters] = useState<ThesisSearchParams>(emptySearch);

  const load = useCallback(async (params: ThesisSearchParams) => {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetchThesisList(params);
      setItems(res.data);
      setTotal(res.meta.total);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Error al cargar el catálogo.');
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load({});
  }, [load]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params: ThesisSearchParams = {};
    if (filters.q?.trim()) params.q = filters.q.trim();
    if (filters.title?.trim()) params.title = filters.title.trim();
    if (filters.author?.trim()) params.author = filters.author.trim();
    if (filters.keyword_name?.trim()) params.keyword_name = filters.keyword_name.trim();
    if (filters.year?.trim()) params.year = filters.year.trim();
    if (filters.program_id?.trim()) params.program_id = filters.program_id.trim();
    if (filters.type_id?.trim()) params.type_id = filters.type_id.trim();
    if (filters.research_line_id?.trim()) params.research_line_id = filters.research_line_id.trim();
    if (filters.keyword_id?.trim()) params.keyword_id = filters.keyword_id.trim();
    void load(params);
  }

  function handleClear() {
    setFilters(emptySearch);
    void load({});
  }

  return (
    <div>
      <h1 className={styles.pageTitle}>Catálogo público</h1>
      <p className={styles.lead}>
        Busca por texto, año, programa, tipo, línea o palabra clave (nombre o ID). Resultados
        paginados (50 por página).
      </p>

      <form className={styles.search} onSubmit={handleSubmit}>
        <label className={styles.field}>
          <span>Búsqueda general</span>
          <input
            type="search"
            placeholder="Título, autor o nombre de palabra clave…"
            value={filters.q ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
          />
        </label>
        <div className={styles.grid}>
          <label className={styles.field}>
            <span>Título</span>
            <input
              value={filters.title ?? ''}
              onChange={(e) => setFilters((f) => ({ ...f, title: e.target.value }))}
            />
          </label>
          <label className={styles.field}>
            <span>Autor</span>
            <input
              value={filters.author ?? ''}
              onChange={(e) => setFilters((f) => ({ ...f, author: e.target.value }))}
            />
          </label>
          <label className={styles.field}>
            <span>Nombre palabra clave</span>
            <input
              placeholder="Contiene…"
              value={filters.keyword_name ?? ''}
              onChange={(e) => setFilters((f) => ({ ...f, keyword_name: e.target.value }))}
            />
          </label>
          <label className={styles.field}>
            <span>Año</span>
            <input
              type="number"
              min={1900}
              max={2100}
              placeholder="ej. 2024"
              value={filters.year ?? ''}
              onChange={(e) => setFilters((f) => ({ ...f, year: e.target.value }))}
            />
          </label>
          <label className={styles.field}>
            <span>ID programa</span>
            <input
              type="number"
              min={1}
              placeholder="Opcional"
              value={filters.program_id ?? ''}
              onChange={(e) => setFilters((f) => ({ ...f, program_id: e.target.value }))}
            />
          </label>
          <label className={styles.field}>
            <span>ID tipo</span>
            <input
              type="number"
              min={1}
              value={filters.type_id ?? ''}
              onChange={(e) => setFilters((f) => ({ ...f, type_id: e.target.value }))}
            />
          </label>
          <label className={styles.field}>
            <span>ID línea inv.</span>
            <input
              type="number"
              min={1}
              value={filters.research_line_id ?? ''}
              onChange={(e) => setFilters((f) => ({ ...f, research_line_id: e.target.value }))}
            />
          </label>
          <label className={styles.field}>
            <span>ID palabra clave</span>
            <input
              type="number"
              min={1}
              value={filters.keyword_id ?? ''}
              onChange={(e) => setFilters((f) => ({ ...f, keyword_id: e.target.value }))}
            />
          </label>
        </div>
        <div className={styles.actions}>
          <button type="submit" className={styles.primary}>
            Buscar
          </button>
          <button type="button" className={styles.secondary} onClick={handleClear}>
            Limpiar
          </button>
        </div>
      </form>

      {loading && <p className={styles.muted}>Cargando…</p>}
      {err && <p className={styles.error}>{err}</p>}

      {!loading && !err && (
        <p className={styles.muted}>
          {total === 0
            ? 'No hay trabajos que coincidan.'
            : `Mostrando ${items.length} de ${total} resultado(s).`}
        </p>
      )}

      <ul className={styles.list}>
        {items.map((t) => (
          <li key={t.id} className={styles.card}>
            <Link to={`/tesis/${t.id}`} className={styles.cardTitle}>
              {t.title}
            </Link>
            <p className={styles.cardMeta}>
              {t.author} · {t.year}
              {t.program?.name ? ` · ${t.program.name}` : ''}
              {t.type?.name ? ` · ${t.type.name}` : ''}
            </p>
            {t.keywords && t.keywords.length > 0 && (
              <p className={styles.keywordChips}>
                {t.keywords.map((k) => (
                  <span key={k.id} className={styles.chip}>
                    {k.name}
                  </span>
                ))}
              </p>
            )}
            <p className={styles.cardAbstract}>{truncate(t.abstract, 180)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function truncate(s: string, n: number) {
  if (s.length <= n) return s;
  return `${s.slice(0, n).trim()}…`;
}
