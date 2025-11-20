import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://5.189.180.242:8087/api') + '/admin';

export default function RealizarSorteo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sorteo, setSorteo] = useState(null);
  const [ganadores, setGanadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sorteando, setSorteando] = useState(false);
  const [modoManual, setModoManual] = useState(false);
  const [ticketManual, setTicketManual] = useState('');
  const [premioSeleccionado, setPremioSeleccionado] = useState(null);

  useEffect(() => {
    loadSorteo();
    loadGanadores();
  }, [id]);

  const loadSorteo = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/sorteos/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSorteo(response.data.data);
    } catch (error) {
      console.error('Error al cargar sorteo:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGanadores = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/sorteos/${id}/ganadores`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGanadores(response.data.data);
    } catch (error) {
      console.error('Error al cargar ganadores:', error);
    }
  };

  const handleSorteoAutomatico = async () => {
    if (!confirm('¿Estás seguro de realizar el sorteo automático? Esta acción no se puede deshacer.')) {
      return;
    }

    setSorteando(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/sorteos/${id}/sortear`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert('¡Sorteo realizado exitosamente!');
        loadGanadores();
        loadSorteo();
      }
    } catch (error) {
      console.error('Error al sortear:', error);
      alert(error.response?.data?.message || 'Error al realizar el sorteo');
    } finally {
      setSorteando(false);
    }
  };

  const handleAsignarGanadorManual = async () => {
    if (!premioSeleccionado || !ticketManual) {
      alert('Selecciona un premio e ingresa el número de ticket');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/sorteos/ganador/asignar`,
        {
          sorteo_id: id,
          premio_id: premioSeleccionado,
          ticket_numero: ticketManual
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert('Ganador asignado exitosamente');
        setTicketManual('');
        setPremioSeleccionado(null);
        loadGanadores();
      }
    } catch (error) {
      console.error('Error al asignar ganador:', error);
      alert(error.response?.data?.message || 'Error al asignar ganador');
    }
  };

  const handleNotificarGanador = async (ganadorId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/sorteos/ganador/${ganadorId}/notificar`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert('Ganador notificado exitosamente');
        loadGanadores();
      }
    } catch (error) {
      console.error('Error al notificar:', error);
      alert('Error al notificar ganador');
    }
  };

  const handleEliminarGanador = async (ganadorId) => {
    if (!confirm('¿Estás seguro de eliminar este ganador?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${API_URL}/sorteos/ganador/${ganadorId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Ganador eliminado exitosamente');
      loadGanadores();
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert(error.response?.data?.message || 'Error al eliminar ganador');
    }
  };

  const getPosicionColor = (posicion) => {
    const colors = {
      1: 'bg-yellow-500',
      2: 'bg-gray-400',
      3: 'bg-orange-500',
      4: 'bg-blue-500',
      5: 'bg-purple-500'
    };
    return colors[posicion] || 'bg-gray-500';
  };

  const getPosicionEmoji = (posicion) => {
    const emojis = { 1: '🥇', 2: '🥈', 3: '🥉', 4: '🏅', 5: '🏅' };
    return emojis[posicion] || '🏅';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/sorteos')}
          className="mb-4 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
        >
          ← Volver a Sorteos
        </button>
        <h1 className="text-3xl font-bold text-white mb-2">Realizar Sorteo</h1>
        <p className="text-gray-400">{sorteo?.nombre}</p>
      </div>

      {/* Información del sorteo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-gray-400 text-sm mb-2">Estado</h3>
          <p className="text-2xl font-bold text-white capitalize">{sorteo?.estado}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-gray-400 text-sm mb-2">Tickets Vendidos</h3>
          <p className="text-2xl font-bold text-white">
            {sorteo?.tickets_vendidos} / {sorteo?.tickets_disponibles}
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-gray-400 text-sm mb-2">Fecha Sorteo</h3>
          <p className="text-2xl font-bold text-white">{sorteo?.fecha_sorteo}</p>
        </div>
      </div>

      {/* Acciones */}
      {ganadores.length === 0 && sorteo?.estado !== 'finalizado' && (
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Opciones de Sorteo</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleSorteoAutomatico}
              disabled={sorteando}
              className="p-6 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sorteando ? 'Sorteando...' : '🎲 Sorteo Automático (Aleatorio)'}
            </button>
            
            <button
              onClick={() => setModoManual(!modoManual)}
              className="p-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
            >
              ✏️ Asignar Ganador Manual
            </button>
          </div>

          {/* Formulario manual */}
          {modoManual && (
            <div className="mt-6 p-6 bg-gray-700 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-4">Asignar Ganador Manualmente</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-300 mb-2">Seleccionar Premio</label>
                  <select
                    value={premioSeleccionado || ''}
                    onChange={(e) => setPremioSeleccionado(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg"
                  >
                    <option value="">Selecciona un premio...</option>
                    {sorteo?.premios?.map(premio => (
                      <option key={premio.id} value={premio.id}>
                        {premio.posicion}° - {premio.descripcion}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Número de Ticket Ganador</label>
                  <input
                    type="text"
                    value={ticketManual}
                    onChange={(e) => setTicketManual(e.target.value)}
                    placeholder="Ej: 100001"
                    maxLength="6"
                    className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg"
                  />
                </div>
              </div>

              <button
                onClick={handleAsignarGanadorManual}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold"
              >
                Asignar Ganador
              </button>
            </div>
          )}
        </div>
      )}

      {/* Lista de ganadores */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">
          {ganadores.length > 0 ? '🏆 Ganadores del Sorteo' : 'Sin ganadores asignados'}
        </h2>

        {ganadores.length > 0 ? (
          <div className="space-y-4">
            {ganadores.map((ganador) => (
              <div
                key={ganador.id}
                className="bg-gray-700 rounded-lg p-6 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 ${getPosicionColor(ganador.posicion)} rounded-full flex items-center justify-center text-3xl`}>
                    {getPosicionEmoji(ganador.posicion)}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold text-white">{ganador.posicion}° Puesto</h3>
                    <p className="text-gray-300">{ganador.premio}</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Ganador: <span className="font-semibold text-white">{ganador.participante.nombre}</span>
                    </p>
                    <p className="text-sm text-gray-400">
                      DNI: {ganador.participante.dni} | Ticket: <span className="font-mono font-bold text-green-400">#{ganador.ticket_ganador}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    ganador.estado === 'notificado' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-yellow-600 text-white'
                  }`}>
                    {ganador.estado === 'notificado' ? '✓ Notificado' : 'Pendiente'}
                  </span>
                  
                  <div className="flex gap-2">
                    {ganador.estado === 'pendiente_notificacion' && (
                      <>
                        <button
                          onClick={() => handleNotificarGanador(ganador.id)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded"
                        >
                          Notificar
                        </button>
                        <button
                          onClick={() => handleEliminarGanador(ganador.id)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded"
                        >
                          Eliminar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-8">
            No se han asignado ganadores aún. Usa las opciones de sorteo arriba.
          </p>
        )}
      </div>
    </div>
  );
}
