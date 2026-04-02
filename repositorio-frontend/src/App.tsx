import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminLayout } from './components/AdminLayout';
import { Layout } from './components/Layout';
import { RequireRole } from './components/RequireRole';
import { AdminClassificationPage } from './pages/admin/AdminClassificationPage';
import { AdminThesisListPage } from './pages/admin/AdminThesisListPage';
import { EditThesisPage } from './pages/admin/EditThesisPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { NewThesisPage } from './pages/NewThesisPage';
import { RegisterPage } from './pages/RegisterPage';
import { ThesisDetailPage } from './pages/ThesisDetailPage';
import { ADMIN_ROLE } from './utils/roles';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="tesis/:id" element={<ThesisDetailPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="registro" element={<RegisterPage />} />

        <Route
          path="admin"
          element={
            <RequireRole roles={[ADMIN_ROLE]}>
              <AdminLayout />
            </RequireRole>
          }
        >
          <Route index element={<Navigate to="tesis" replace />} />
          <Route path="tesis" element={<AdminThesisListPage />} />
          <Route path="tesis/nueva" element={<NewThesisPage />} />
          <Route path="tesis/:id/editar" element={<EditThesisPage />} />
          <Route path="clasificacion" element={<AdminClassificationPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
