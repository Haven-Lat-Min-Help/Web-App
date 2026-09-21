import { Navigate, Route, Routes } from 'react-router-dom';
import { RequireSuperAdmin } from './components/RequireSuperAdmin';
import { AdminLogin } from './screens/AdminLogin';
import { Dashboard } from './screens/Dashboard';

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
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
