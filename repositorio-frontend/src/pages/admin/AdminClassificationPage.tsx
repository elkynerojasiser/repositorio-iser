import { Link } from 'react-router-dom';
import {
  createKeywordEntity,
  createResearchLine,
  createThesisType,
  deleteKeywordEntity,
  deleteResearchLine,
  deleteThesisType,
  fetchKeywordCatalog,
  fetchResearchLines,
  fetchThesisTypes,
  updateKeywordEntity,
  updateResearchLine,
  updateThesisType,
} from '../../api/classification';
import {
  createAcademicProgram,
  deleteAcademicProgram,
  fetchAcademicPrograms,
  updateAcademicProgram,
} from '../../api/programs';
import { ClassificationEntitySection } from '../../components/ClassificationEntitySection';
import { useAuth } from '../../context/AuthContext';
import styles from '../Pages.module.css';

const programsApi = {
  load: fetchAcademicPrograms,
  create: createAcademicProgram,
  update: updateAcademicProgram,
  remove: deleteAcademicProgram,
};

const thesisTypesApi = {
  load: fetchThesisTypes,
  create: createThesisType,
  update: updateThesisType,
  remove: deleteThesisType,
};

const researchLinesApi = {
  load: fetchResearchLines,
  create: createResearchLine,
  update: updateResearchLine,
  remove: deleteResearchLine,
};

const keywordsApi = {
  load: fetchKeywordCatalog,
  create: createKeywordEntity,
  update: updateKeywordEntity,
  remove: deleteKeywordEntity,
};

export function AdminClassificationPage() {
  const { token } = useAuth();
  if (!token) return null;

  return (
    <div>
      <Link to="/admin/tesis" className={styles.back}>
        ← Trabajos de grado
      </Link>
      <h1 className={styles.pageTitle}>Criterios de clasificación</h1>
      <p className={styles.lead}>
        Administra programas académicos, tipos de trabajo, líneas de investigación y palabras clave.
        Estos valores aparecen en los formularios de carga de tesis y en los filtros del catálogo
        público.
      </p>

      <ClassificationEntitySection
        title="Programas académicos"
        hint="Asigna cada trabajo a un programa. Si eliminas uno en uso por tesis, el servidor puede rechazar la operación."
        token={token}
        api={programsApi}
      />

      <ClassificationEntitySection
        title="Tipos de trabajo"
        token={token}
        api={thesisTypesApi}
      />

      <ClassificationEntitySection
        title="Líneas de investigación"
        token={token}
        api={researchLinesApi}
      />

      <ClassificationEntitySection
        title="Palabras clave"
        hint="Catálogo reutilizable; en cada tesis se pueden elegir varias desde el formulario."
        token={token}
        api={keywordsApi}
      />
    </div>
  );
}
