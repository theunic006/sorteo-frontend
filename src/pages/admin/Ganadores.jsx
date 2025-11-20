import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://5.189.180.242:8087/api';

export default function AdminGanadores() {
  const [ganadores, setGanadores] = useState([]);
  const [sorteos, setSorteos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSorteo, setSelectedSorteo] = useState('todos');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const [ganadoresRes, sorteosRes] = await Promise.all([
        axios.get(`${API_URL}/admin/ganadores`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/admin/sorteos`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setGanadores(ganadoresRes.data.data || []);
      setSorteos(sorteosRes.data.data || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGanadores = selectedSorteo === 'todos'
    ? ganadores
    : ganadores.filter(g => g.sorteo_id === parseInt(selectedSorteo));

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(value || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Ganadores</h2>
        <p className="text-gray-600 mt-1">Listado de ganadores de todos los sorteos</p>
      </div>

      {/* Filtro */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filtrar por sorteo:</label>
          <select
            value={selectedSorteo}
            onChange={(e) => setSelectedSorteo(e.target.value)}
            className="flex-1 sm:max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="todos">Todos los sorteos</option>
            {sorteos.map(sorteo => (
              <option key={sorteo.id} value={sorteo.id}>
                {sorteo.nombre}
              </option>
            ))}
          </select>
          <div className="text-sm text-gray-600">
            <span className="font-semibold">{filteredGanadores.length}</span> ganador(es)
          </div>
        </div>
      </div>

      {/* Cards de Ganadores */}
      {filteredGanadores.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay ganadores aún</h3>
          <p className="text-gray-600">
            {selectedSorteo === 'todos'
              ? 'Aún no se han registrado ganadores en ningún sorteo'
              : 'No hay ganadores para el sorteo seleccionado'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGanadores.map((ganador, index) => (
            <div key={ganador.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {/* Header con posición */}
              <div className={`px-6 py-4 ${
                index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-500' :
                index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                'bg-gradient-to-r from-blue-500 to-blue-700'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-gray-900">
                        {index + 1}°
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">
                        {index === 0 ? 'Primer Lugar' :
                         index === 1 ? 'Segundo Lugar' :
                         index === 2 ? 'Tercer Lugar' :
                         `Puesto ${index + 1}`}
                      </p>
                    </div>
                  </div>
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              </div>

              {/* Contenido */}
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {ganador.participante?.nombre || 'N/A'}
                  </h3>
                  <p className="text-sm text-gray-600">{ganador.participante?.email || 'N/A'}</p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sorteo:</span>
                    <span className="font-medium text-gray-900">{ganador.sorteo?.nombre || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Premio:</span>
                    <span className="font-medium text-gray-900">{ganador.premio?.nombre || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ticket Ganador:</span>
                    <span className="font-mono font-bold text-blue-600">
                      #{ganador.ticket?.numero || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fecha:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(ganador.created_at).toLocaleDateString('es-PE')}
                    </span>
                  </div>
                </div>

                {/* Estado de entrega */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Estado:</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      ganador.premio_entregado
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {ganador.premio_entregado ? 'Premio Entregado' : 'Pendiente de Entrega'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
