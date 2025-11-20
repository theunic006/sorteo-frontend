import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://5.189.180.242:8087/api';

export default function Ganadores() {
  const [ganadores, setGanadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroYear, setFiltroYear] = useState('');
  const [filtroMonth, setFiltroMonth] = useState('');

  useEffect(() => {
    loadGanadores();
  }, [filtroYear, filtroMonth]);

  const loadGanadores = async () => {
    try {
      const params = {};
      if (filtroYear) params.year = filtroYear;
      if (filtroMonth) params.month = filtroMonth;

      const response = await axios.get(`${API_URL}/historial-ganadores`, { params });
      setGanadores(response.data.data);
    } catch (error) {
      console.error('Error al cargar ganadores:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount);
  };

  const getPosicionEmoji = (posicion) => {
    const emojis = {
      1: '🥇',
      2: '🥈',
      3: '🥉',
      4: '🏅',
      5: '🏅'
    };
    return emojis[posicion] || '🏅';
  };

  const getPosicionColor = (posicion) => {
    const colors = {
      1: 'from-yellow-400 to-yellow-600',
      2: 'from-gray-300 to-gray-500',
      3: 'from-orange-400 to-orange-600',
      4: 'from-blue-400 to-blue-600',
      5: 'from-purple-400 to-purple-600'
    };
    return colors[posicion] || 'from-gray-400 to-gray-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-500 mx-auto"></div>
          <p className="text-white mt-4">Cargando ganadores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black text-white mb-4">🏆 Ganadores Anteriores</h1>
        <p className="text-xl text-gray-300">
          Conoce a los afortunados ganadores de nuestros sorteos
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-6 border border-gray-700/50 mb-8">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-white font-semibold mb-2">Filtrar por año</label>
            <select
              value={filtroYear}
              onChange={(e) => setFiltroYear(e.target.value)}
              className="w-full px-4 py-3 bg-black/60 border border-gray-700/50 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Todos los años</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-white font-semibold mb-2">Filtrar por mes</label>
            <select
              value={filtroMonth}
              onChange={(e) => setFiltroMonth(e.target.value)}
              className="w-full px-4 py-3 bg-black/60 border border-gray-700/50 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Todos los meses</option>
              <option value="1">Enero</option>
              <option value="2">Febrero</option>
              <option value="3">Marzo</option>
              <option value="4">Abril</option>
              <option value="5">Mayo</option>
              <option value="6">Junio</option>
              <option value="7">Julio</option>
              <option value="8">Agosto</option>
              <option value="9">Septiembre</option>
              <option value="10">Octubre</option>
              <option value="11">Noviembre</option>
              <option value="12">Diciembre</option>
            </select>
          </div>
          {(filtroYear || filtroMonth) && (
            <button
              onClick={() => {
                setFiltroYear('');
                setFiltroMonth('');
              }}
              className="px-6 py-3 bg-gray-700/50 text-white rounded-full hover:bg-gray-600/50 transition-all"
            >
              Limpiar Filtros
            </button>
          )}
        </div>
      </div>

      {/* Lista de sorteos con ganadores */}
      {ganadores.length === 0 ? (
        <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-12 border border-gray-700/50 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold text-white mb-2">No se encontraron sorteos finalizados</h3>
          <p className="text-gray-400">Intenta cambiar los filtros o espera a que se realicen sorteos</p>
        </div>
      ) : (
        <div className="space-y-8">
          {ganadores.map((sorteo, index) => (
            <div
              key={index}
              className="bg-black/40 backdrop-blur-xl rounded-3xl overflow-hidden border border-gray-700/50 hover:border-green-500/50 transition-all"
            >
              {/* Header del sorteo */}
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-6 border-b border-gray-700/50">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    {sorteo.sorteo.imagen && (
                      <img
                        src={sorteo.sorteo.imagen}
                        alt={sorteo.sorteo.nombre}
                        className="w-20 h-20 rounded-2xl object-cover border-2 border-green-500"
                      />
                    )}
                    <div>
                      <h2 className="text-2xl font-bold text-white">{sorteo.sorteo.nombre}</h2>
                      <p className="text-gray-300">
                        Sorteo realizado el {new Date(sorteo.sorteo.fecha).toLocaleDateString('es-PE', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => window.open('https://www.facebook.com/', '_blank')}
                    className="px-6 py-3 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-500 transition-all flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Ver Transmisión
                  </button>
                </div>
              </div>

              {/* Ganadores */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <span>🎉</span>
                  Ganadores del Sorteo
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {sorteo.ganadores.map((ganador, gIndex) => (
                    <div
                      key={gIndex}
                      className="bg-black/60 rounded-2xl p-6 border border-gray-700/50 hover:border-green-500/50 transition-all"
                    >
                      <div className="flex items-start gap-4">
                        {/* Badge de posición */}
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getPosicionColor(ganador.posicion)} flex items-center justify-center text-3xl flex-shrink-0 shadow-lg`}>
                          {getPosicionEmoji(ganador.posicion)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold text-white text-lg">{ganador.posicion}° Puesto</h4>
                            <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-mono">
                              #{ganador.ticket_ganador}
                            </div>
                          </div>
                          
                          <p className="text-2xl font-bold text-white mb-1">{ganador.participante.nombre}</p>
                          <p className="text-sm text-gray-400 mb-3">DNI: {ganador.participante.dni}</p>
                          
                          <div className="bg-black/60 rounded-xl p-3 border border-gray-700/50">
                            <p className="text-sm text-gray-400 mb-1">Premio ganado:</p>
                            <p className="text-white font-semibold">{ganador.premio.descripcion}</p>
                            {ganador.premio.valor && (
                              <p className="text-green-400 font-bold mt-1">
                                Valor: {formatCurrency(ganador.premio.valor)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="bg-black/40 p-4 border-t border-gray-700/50">
                <div className="flex items-center justify-center gap-4 text-gray-400 text-sm">
                  <button className="hover:text-green-400 transition-all flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Compartir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Información adicional */}
      <div className="mt-12 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-3xl p-8">
        <div className="flex items-start gap-4">
          <div className="text-4xl">🎯</div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2">¿Cómo se elige a los ganadores?</h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-green-400">•</span>
                <span>Todos los sorteos se realizan en vivo por Facebook Live para total transparencia</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">•</span>
                <span>Los números ganadores se seleccionan de forma aleatoria y verificable</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">•</span>
                <span>Los ganadores son contactados inmediatamente después del sorteo</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">•</span>
                <span>Puedes consultar si tu número ganó ingresando tu DNI en "Consulta de Tickets"</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
