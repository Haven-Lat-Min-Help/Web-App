import { Navigate, Route, Routes } from 'react-router-dom';
import { RequireSuperAdmin } from './components/RequireSuperAdmin';
import { AdminLogin } from './screens/AdminLogin';
import { CreateOrganization } from './screens/CreateOrganization';
import { Dashboard } from './screens/Dashboard';
import { Organizations } from './screens/Organizations';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<AdminLogin />} />
      <Route
        path="/dashboard"
        element={
          <RequireSuperAdmin>
            <Dashboard />
          </RequireSuperAdmin>
        }
      />
      <Route
        path="/organizations"
        element={
          <RequireSuperAdmin>
            <Organizations />
          </RequireSuperAdmin>
        }
      />
      <Route
        path="/organizations/new"
        element={
          <RequireSuperAdmin>
            <CreateOrganization />
          </RequireSuperAdmin>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
