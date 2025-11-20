import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';

// Páginas públicas
import Home from './pages/public/Home';
import DetalleSorteo from './pages/public/DetalleSorteo';
import ConsultaTickets from './pages/public/ConsultaTickets';
import Ganadores from './pages/public/Ganadores';
import Participar from './pages/public/Participar';

// Páginas admin
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminSorteos from './pages/admin/Sorteos';
import AdminCompras from './pages/admin/Compras';
import AdminParticipantes from './pages/admin/Participantes';
import AdminGanadores from './pages/admin/Ganadores';
import RealizarSorteo from './pages/admin/RealizarSorteo';
import ConfiguracionWhatsApp from './pages/admin/ConfiguracionWhatsApp';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="sorteo/:id" element={<DetalleSorteo />} />
          <Route path="participar/:id" element={<Participar />} />
          <Route path="consulta-tickets" element={<ConsultaTickets />} />
          <Route path="ganadores" element={<Ganadores />} />
        </Route>

        {/* Login admin */}
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Rutas admin (con layout protegido) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="sorteos" element={<AdminSorteos />} />
          <Route path="sorteos/:id/realizar" element={<RealizarSorteo />} />
          <Route path="compras" element={<AdminCompras />} />
          <Route path="participantes" element={<AdminParticipantes />} />
          <Route path="ganadores" element={<AdminGanadores />} />
          <Route path="whatsapp" element={<ConfiguracionWhatsApp />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

