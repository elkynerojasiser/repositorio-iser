import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  fetchKeywordCatalog,
  fetchResearchLines,
  fetchThesisTypes,
} from '../../api/classification';
import { createAcademicProgram, fetchAcademicPrograms } from '../../api/programs';
import { getThesisStaff, updateThesisWithPdf } from '../../api/thesisAdmin';
import type { AcademicProgramRef, ClassificationRef } from '../../api/types';
import { useAuth } from '../../context/AuthContext';
import styles from '../Pages.module.css';

function isAdminRole(user: { role?: { name: string } } | null): boolean {
  return user?.role?.name === 'admin';
}

export function EditThesisPage() {
  const { id } = useParams();
  const numId = id ? Number(id) : NaN;
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const admin = isAdminRole(user);

  const [programs, setPrograms] = useState<AcademicProgramRef[]>([]);
  const [thesisTypes, setThesisTypes] = useState<ClassificationRef[]>([]);
  const [researchLines, setResearchLines] = useState<ClassificationRef[]>([]);
  const [keywordCatalog, setKeywordCatalog] = useState<ClassificationRef[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittingProgram, setSubmittingProgram] = useState(false);
  const [newProgramName, setNewProgramName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [abstract, setAbstract] = useState('');
  const [year, setYear] = useState('');
  const [programId, setProgramId] = useState('');
  const [typeId, setTypeId] = useState('');
  const [researchLineId, setResearchLineId] = useState('');
  const [keywordIds, setKeywordIds] = useState<number[]>([]);
  const [pdf, setPdf] = useState<File | null>(null);
  const [currentPdfPath, setCurrentPdfPath] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !Number.isFinite(numId)) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const [progs, types, lines, kws, thesis] = await Promise.all([
          fetchAcademicPrograms(token),
          fetchThesisTypes(token),
          fetchResearchLines(token),
          fetchKeywordCatalog(token),
          getThesisStaff(token, numId),
        ]);
        if (cancelled) return;
        setPrograms(progs);
        setThesisTypes(types);
        setResearchLines(lines);
        setKeywordCatalog(kws);
        setTitle(thesis.title);
        setAuthor(thesis.author);
        setAbstract(thesis.abstract);
        setYear(String(thesis.year));
        setProgramId(String(thesis.programId ?? thesis.program?.id ?? ''));
        setTypeId(String(thesis.typeId ?? thesis.type?.id ?? ''));
        setResearchLineId(String(thesis.researchLineId ?? thesis.research_line?.id ?? ''));
        setKeywordIds(thesis.keywords?.map((k) => k.id) ?? []);
        setCurrentPdfPath(thesis.filePath ?? null);
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : 'No se pudo cargar los datos.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, numId]);

  async function handleCreateProgram(e: FormEvent) {
    e.preventDefault();
    if (!token || !admin) return;
    const name = newProgramName.trim();
    if (!name) {
      setError('Escribe el nombre del programa.');
      return;
    }
    setSubmittingProgram(true);
    setError(null);
    try {
      const created = await createAcademicProgram(token, name);
      setPrograms((prev) => [...prev, created]);
      setProgramId(String(created.id));
      setNewProgramName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el programa.');
    } finally {
      setSubmittingProgram(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token || !Number.isFinite(numId)) return;
    const y = Number(year);
    const pid = Number(programId);
    const tid = Number(typeId);
    const rid = Number(researchLineId);
    if (!Number.isFinite(y) || !Number.isFinite(pid) || !Number.isFinite(tid) || !Number.isFinite(rid)) {
      setError('Año, programa, tipo o línea no válidos.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await updateThesisWithPdf(
        token,
        numId,
        {
          title: title.trim(),
          author: author.trim(),
          abstract: abstract.trim(),
          year: y,
          programId: pid,
          typeId: tid,
          researchLineId: rid,
          keywordIds,
        },
        pdf
      );
      navigate('/admin/tesis', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!Number.isFinite(numId)) {
    return (
      <p className={styles.error}>
        ID no válido. <Link to="/admin/tesis">Volver al listado</Link>
      </p>
    );
  }

  if (loading) return <p className={styles.muted}>Cargando…</p>;

  if (loadError) {
    return (
      <div>
        <p className={styles.error}>{loadError}</p>
        <Link to="/admin/tesis">← Listado</Link>
      </div>
    );
  }

  const missingCatalog =
    programs.length === 0 || thesisTypes.length === 0 || researchLines.length === 0;

  return (
    <div>
      <Link to="/admin/tesis" className={styles.back}>
        ← Trabajos de grado
      </Link>
      <h1 className={styles.pageTitle}>Editar trabajo</h1>
      <p className={styles.lead}>
        Modifica los datos. El PDF es opcional: súbelo solo si quieres reemplazar el archivo
        actual. Las palabras clave se eligen del catálogo.
      </p>
      {currentPdfPath && (
        <p className={styles.muted}>
          PDF actual: <code className={styles.codeInline}>{currentPdfPath}</code>
        </p>
      )}

      {missingCatalog && (
        <p className={styles.error}>
          Faltan programas, tipos o líneas en el catálogo. Completa la configuración antes de
          guardar.
        </p>
      )}

      {!missingCatalog && (
        <form className={styles.staffForm} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span>Título</span>
            <input required value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label className={styles.field}>
            <span>Autor</span>
            <input required value={author} onChange={(e) => setAuthor(e.target.value)} />
          </label>
          <label className={styles.field}>
            <span>Programa académico</span>
            <select
              required
              value={programId}
              onChange={(e) => setProgramId(e.target.value)}
            >
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            <span>Tipo de trabajo</span>
            <select required value={typeId} onChange={(e) => setTypeId(e.target.value)}>
              {thesisTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            <span>Línea de investigación</span>
            <select
              required
              value={researchLineId}
              onChange={(e) => setResearchLineId(e.target.value)}
            >
              {researchLines.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            <span>Palabras clave</span>
            <select
              multiple
              className={styles.selectMultiple}
              value={keywordIds.map(String)}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions).map((o) => Number(o.value));
                setKeywordIds(selected);
              }}
            >
              {keywordCatalog.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.name}
                </option>
              ))}
            </select>
            <span className={styles.fieldHint}>Ctrl/Cmd para múltiple selección.</span>
          </label>
          <label className={styles.field}>
            <span>Año</span>
            <input
              type="number"
              required
              min={1900}
              max={2100}
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
          </label>
          <label className={styles.field}>
            <span>Resumen (abstract)</span>
            <textarea
              required
              rows={5}
              value={abstract}
              onChange={(e) => setAbstract(e.target.value)}
            />
          </label>
          <label className={styles.field}>
            <span>Nuevo PDF (opcional)</span>
            <input
              type="file"
              accept="application/pdf,.pdf"
              onChange={(e) => setPdf(e.target.files?.[0] ?? null)}
            />
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.primary} disabled={submitting || missingCatalog}>
            {submitting ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </form>
      )}

      {programs.length === 0 && admin && (
        <div className={styles.inlineCard}>
          <p className={styles.muted}>No hay programas. Crea uno para asignar al trabajo.</p>
          <form className={styles.staffForm} onSubmit={handleCreateProgram}>
            <label className={styles.field}>
              <span>Nombre del programa</span>
              <input
                required
                value={newProgramName}
                onChange={(e) => setNewProgramName(e.target.value)}
              />
            </label>
            {error && <p className={styles.error}>{error}</p>}
            <button type="submit" className={styles.primary} disabled={submittingProgram}>
              {submittingProgram ? 'Creando…' : 'Crear programa'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
