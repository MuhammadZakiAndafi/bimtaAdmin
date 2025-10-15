import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AkunMahasiswa from './pages/AkunMahasiswa';
import AkunDosen from './pages/AkunDosen';
import ReferensiTA from './pages/ReferensiTA';
import GenerateLaporan from './pages/GenerateLaporan';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/akun-mahasiswa" element={<AkunMahasiswa />} />
          <Route path="/akun-dosen" element={<AkunDosen />} />
          <Route path="/referensi-ta" element={<ReferensiTA />} />
          <Route path="/generate-laporan" element={<GenerateLaporan />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;