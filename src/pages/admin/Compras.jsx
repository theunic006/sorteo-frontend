import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://5.189.180.242:8087/api';

export default function AdminCompras() {
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('todas');
  const [showModal, setShowModal] = useState(false);
  const [selectedCompra, setSelectedCompra] = useState(null);
  const [notas, setNotas] = useState('');

  useEffect(() => {
    loadCompras();
  }, [filter]);

  const loadCompras = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const params = filter !== 'todas' ? { estado: filter } : {};
      const response = await axios.get(`${API_URL}/admin/compras`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setCompras(response.data.data || []);
    } catch (error) {
      console.error('Error al cargar compras:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerificar = async (compra) => {
    if (!confirm('¿Confirmar la verificación de esta compra?')) return;
    try {
      const token = localStorage.getItem('admin_token');
      await axios.post(`${API_URL}/admin/compras/${compra.id}/verificar`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Compra verificada exitosamente');
      loadCompras();
    } catch (error) {
      console.error('Error al verificar compra:', error);
      alert('Error al verificar la compra');
    }
  };

  const handleRechazar = async () => {
    if (!notas.trim()) {
      alert('Por favor, ingresa el motivo del rechazo');
      return;
    }
    try {
      const token = localStorage.getItem('admin_token');
      await axios.post(`${API_URL}/admin/compras/${selectedCompra.id}/rechazar`, 
        { notas },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Compra rechazada');
      setShowModal(false);
      setSelectedCompra(null);
      setNotas('');
      loadCompras();
    } catch (error) {
      console.error('Error al rechazar compra:', error);
      alert('Error al rechazar la compra');
    }
  };

  const openRechazarModal = (compra) => {
    setSelectedCompra(compra);
    setNotas('');
    setShowModal(true);
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      pendiente: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendiente' },
      verificado: { bg: 'bg-green-100', text: 'text-green-800', label: 'Verificado' },
      rechazado: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rechazado' }
    };
    return badges[estado] || badges.pendiente;
  };

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
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Compras</h2>
        <p className="text-gray-600 mt-1">Verifica y administra las compras de tickets</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('todas')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'todas'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter('pendiente')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'pendiente'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pendientes
          </button>
          <button
            onClick={() => setFilter('verificado')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'verificado'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Verificadas
          </button>
          <button
            onClick={() => setFilter('rechazado')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'rechazado'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Rechazadas
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Participante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sorteo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tickets
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {compras.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No hay compras {filter !== 'todas' ? `en estado "${filter}"` : 'registradas'}
                  </td>
                </tr>
              ) : (
                compras.map((compra) => {
                  const badge = getEstadoBadge(compra.estado);
                  return (
                    <tr key={compra.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {compra.participante?.nombre || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {compra.participante?.email || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{compra.sorteo?.nombre || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {compra.cantidad_tickets || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(compra.monto_total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(compra.created_at).toLocaleDateString('es-PE')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${badge.bg} ${badge.text}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {compra.estado === 'pendiente' && (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleVerificar(compra)}
                              className="text-green-600 hover:text-green-900"
                              title="Verificar"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => openRechazarModal(compra)}
                              className="text-red-600 hover:text-red-900"
                              title="Rechazar"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        )}
                        {compra.estado !== 'pendiente' && (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Rechazar */}
      {showModal && selectedCompra && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowModal(false)}></div>
            
            <div className="inline-block w-full max-w-md overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-xl">
              <div className="bg-red-600 px-6 py-4">
                <h3 className="text-lg font-medium text-white">
                  Rechazar Compra
                </h3>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-semibold">Participante:</span> {selectedCompra.participante?.nombre}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-semibold">Monto:</span> {formatCurrency(selectedCompra.monto_total)}
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    <span className="font-semibold">Tickets:</span> {selectedCompra.cantidad_tickets}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Motivo del rechazo *
                  </label>
                  <textarea
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Explica el motivo del rechazo..."
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedCompra(null);
                      setNotas('');
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleRechazar}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Rechazar Compra
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
