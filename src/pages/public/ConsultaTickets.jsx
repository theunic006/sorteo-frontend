import { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://5.189.180.242:8087/api';

export default function ConsultaTickets() {
  const [dni, setDni] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState('');

  const handleConsultar = async (e) => {
    e.preventDefault();
    setError('');
    setResultado(null);

    if (dni.length < 8) {
      setError('Ingresa un DNI válido (mínimo 8 dígitos)');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/consultar-tickets`, { dni });
      setResultado(response.data.data);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError('No se encontraron registros con este DNI');
      } else {
        setError('Error al consultar. Intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDescargarComprobante = () => {
    // TODO: Implementar descarga de PDF
    alert('Función de descarga de comprobante en desarrollo');
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-white mb-4">🔍 Consulta tus Tickets</h1>
          <p className="text-xl text-gray-300">
            Ingresa tu DNI para ver tus tickets y participaciones
          </p>
        </div>

        {/* Formulario de búsqueda */}
        <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 mb-8">
          <form onSubmit={handleConsultar} className="space-y-6">
            <div>
              <label htmlFor="dni" className="block text-white font-semibold mb-2">
                Número de DNI
              </label>
              <input
                type="text"
                id="dni"
                value={dni}
                onChange={(e) => setDni(e.target.value.replace(/\D/g, ''))}
                placeholder="Ej: 12345678"
                maxLength="8"
                className="w-full px-6 py-4 bg-black/60 border border-gray-700/50 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                required
              />
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl">
                <p className="text-red-400 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-green-500 text-black text-lg font-bold rounded-full hover:bg-green-400 transition-all transform hover:scale-105 shadow-2xl shadow-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Consultando...
                </span>
              ) : (
                '🔍 Consultar'
              )}
            </button>
          </form>
        </div>

        {/* Resultados */}
        {resultado && (
          <div className="space-y-6">
            {/* Información del participante */}
            <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-3xl">
                  ✓
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{resultado.participante.estado}</h2>
                  <p className="text-gray-400">Tu registro ha sido confirmado</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Nombre Completo</p>
                  <p className="text-lg font-semibold text-white">{resultado.participante.nombre}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">DNI</p>
                  <p className="text-lg font-semibold text-white">{resultado.participante.dni}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="text-lg font-semibold text-white">{resultado.participante.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Celular</p>
                  <p className="text-lg font-semibold text-white">{resultado.participante.celular}</p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-black/60 rounded-2xl p-4 border border-gray-700/50">
                  <p className="text-sm text-gray-400">Total de Compras</p>
                  <p className="text-3xl font-bold text-green-400">{resultado.total_compras}</p>
                </div>
                <div className="bg-black/60 rounded-2xl p-4 border border-gray-700/50">
                  <p className="text-sm text-gray-400">Total de Tickets</p>
                  <p className="text-3xl font-bold text-green-400">{resultado.total_tickets}</p>
                </div>
              </div>
            </div>

            {/* Listado de tickets */}
            <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">🎫 Tus Números de la Suerte</h3>
                <button
                  onClick={handleDescargarComprobante}
                  className="px-6 py-3 bg-green-500 text-black font-bold rounded-full hover:bg-green-400 transition-all"
                >
                  📄 Descargar Comprobante
                </button>
              </div>

              <div className="space-y-4">
                {resultado.tickets.map((ticket, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-black/60 rounded-2xl border border-gray-700/50 hover:border-green-500/50 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-black font-bold text-lg">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="text-2xl font-mono font-bold text-white">{ticket.numero}</p>
                        <p className="text-sm text-gray-400">{ticket.sorteo}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                        ticket.estado === 'activo'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {ticket.estado === 'activo' ? '✓ Activo' : 'Finalizado'}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Sorteo: {new Date(ticket.fecha_sorteo).toLocaleDateString('es-PE')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Historial de compras */}
            <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50">
              <h3 className="text-2xl font-bold text-white mb-6">📋 Historial de Compras</h3>
              <div className="space-y-3">
                {resultado.compras.map((compra, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-black/60 rounded-2xl border border-gray-700/50"
                  >
                    <div>
                      <p className="font-semibold text-white">{compra.sorteo}</p>
                      <p className="text-sm text-gray-400">Fecha: {compra.fecha}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-400">
                        S/ {parseFloat(compra.monto_total).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-400">{compra.cantidad_tickets} tickets</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Información adicional */}
            <div className="bg-green-500/10 border border-green-500/30 rounded-3xl p-6">
              <p className="text-green-400 flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold">
                  Tus números están registrados correctamente. ¡Mucha suerte en el sorteo!
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Información de ayuda */}
        {!resultado && (
          <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50">
            <h3 className="text-xl font-bold text-white mb-4">ℹ️ Información</h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-green-400">•</span>
                <span>Ingresa el DNI que usaste al momento de registrar tu compra</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">•</span>
                <span>Podrás ver todos tus números de tickets y el estado de tus compras</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">•</span>
                <span>Si no encuentras tu registro, contacta a soporte</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">•</span>
                <span>Guarda tus números de tickets en un lugar seguro</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
