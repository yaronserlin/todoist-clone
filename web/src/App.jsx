import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppNavbar from './components/layout/AppNavbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { setNavigator } from './utils/navigationService';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function App() {
  const navigate = useNavigate();

  useEffect(() => setNavigator(navigate), [navigate]);
  return (
    <>

      <AppNavbar />
      <div className="container mt-4">

        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
          </Route>
        </Routes>

      </div>

    </>
  );
}
