import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://5.189.180.242:8087/api';

export default function Home() {
  const [sorteos, setSorteos] = useState([]);
  const [ganadores, setGanadores] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.max(sorteos.length, 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [sorteos.length]);

  const loadData = async () => {
    try {
      // Cargar sorteos activos
      const sorteosRes = await axios.get(`${API_URL}/sorteos-activos`);
      let sorteosData = sorteosRes.data.data || [];
      
      // Tomar solo los primeros 3 sorteos
      setSorteos(sorteosData.slice(0, 3));
      
      // Cargar ganadores recientes
      const ganadoresRes = await axios.get(`${API_URL}/ganadores-recientes`);
      setGanadores(ganadoresRes.data.data || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      // Datos de demostración
      setSorteos([
        {
          id: 1,
          nombre: 'iPhone 15 Pro Max',
          descripcion: 'Participa y gana el último iPhone 15 Pro Max de 256GB',
          fecha_sorteo: '2025-12-25',
          precio_ticket: 10,
          tickets_disponibles: 5000,
          tickets_vendidos: 3500,
          imagen: 'https://images.unsplash.com/photo-1592286927505-c80c6f34c4c2?w=800',
          imagen_card_url: 'https://images.unsplash.com/photo-1592286927505-c80c6f34c4c2?w=800'
        },
        {
          id: 2,
          nombre: 'Toyota Corolla 2025',
          descripcion: 'Auto 0KM último modelo con todos los accesorios',
          fecha_sorteo: '2025-12-31',
          precio_ticket: 50,
          tickets_disponibles: 10000,
          tickets_vendidos: 7500,
          imagen: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800',
          imagen_card_url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800'
        },
        {
          id: 3,
          nombre: 'MacBook Pro M3',
          descripcion: 'Laptop de última generación para profesionales',
          fecha_sorteo: '2025-11-30',
          precio_ticket: 20,
          tickets_disponibles: 3000,
          tickets_vendidos: 2100,
          imagen: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
          imagen_card_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800'
        }
      ]);
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

  const calculateProgress = (vendidos, disponibles) => {
    return ((vendidos / disponibles) * 100).toFixed(1);
  };

  const getDaysRemaining = (fecha) => {
    const diff = new Date(fecha) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-500 mx-auto"></div>
          <p className="text-white mt-4">Cargando sorteos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen md:-mt-32 bg-gray-900">
      {/* Hero Slider - Pantalla Completa */}
      <section className="relative h-screen overflow-hidden -mx-4 lg:-mx-16">
        {/* Botón Iniciar Sesión Flotante */}
        <button
          onClick={() => navigate('/admin/login')}
          className="absolute top-8 right-8 z-50 px-6 py-3 bg-green-500 text-black font-bold rounded-full hover:bg-green-400 transition-all transform hover:scale-105 shadow-2xl shadow-green-500/50"
        >
          Iniciar Sesión
        </button>

        <div className="absolute inset-0">
          {sorteos.map((sorteo, index) => (
            <div
              key={sorteo.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src={sorteo.imagen_slider_url || sorteo.imagen_url || sorteo.imagen}
                  alt={sorteo.nombre}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80 md:bg-gradient-to-r md:from-gray-900 md:via-gray-900/70 md:to-transparent"></div>
              </div>

              {/* Content */}
              <div className="relative h-full flex items-center justify-center md:justify-start px-4 md:px-8 lg:px-16 md:ml-28 pb-32 md:pb-0">
                <div className="max-w-2xl text-center md:text-left w-full">
                  <div className="inline-block px-3 py-1.5 md:px-4 md:py-2 bg-green-500 text-black rounded-full text-xs md:text-sm font-bold mb-2 md:mb-4 animate-pulse">
                    ⚡ Sorteo Activo
                  </div>
                  
                  <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-white mb-2 md:mb-4 drop-shadow-2xl leading-tight">
                    {sorteo.nombre}
                  </h1>
                  
                  <p className="text-xs md:text-xl text-gray-300 mb-4 md:mb-6 px-2 md:px-0 line-clamp-2">
                    {sorteo.descripcion}
                  </p>

                  {/* Info compacta sin cards para móvil */}
                  <div className="flex flex-col md:flex-row md:flex-wrap items-center gap-3 md:gap-4 mb-4 md:mb-8">
                    {/* Desktop: Cards con fondo */}
                    <div className="hidden md:flex md:flex-wrap gap-4">
                      <div className="bg-black/40 backdrop-blur-xl rounded-2xl px-6 py-3 border border-gray-700/50">
                        <p className="text-sm text-gray-300">Precio por ticket</p>
                        <p className="text-2xl font-bold text-green-400">{formatCurrency(sorteo.precio_ticket)}</p>
                      </div>
                      <div className="bg-black/40 backdrop-blur-xl rounded-2xl px-6 py-3 border border-gray-700/50">
                        <p className="text-sm text-gray-300">Fecha del sorteo</p>
                        <p className="text-2xl font-bold text-white">{new Date(sorteo.fecha_sorteo).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                      </div>
                      <div className="bg-black/40 backdrop-blur-xl rounded-2xl px-6 py-3 border border-gray-700/50">
                        <p className="text-sm text-gray-300">Sorteo en</p>
                        <p className="text-2xl font-bold text-white">{getDaysRemaining(sorteo.fecha_sorteo)} días</p>
                      </div>
                    </div>

                    {/* Móvil: Info compacta sin cards */}
                    <div className="flex md:hidden items-center justify-center gap-4 md:gap-6 text-center">
                      <div>
                        <p className="text-[10px] text-gray-400 mb-0.5">Precio</p>
                        <p className="text-base font-bold text-green-400">{formatCurrency(sorteo.precio_ticket)}</p>
                      </div>
                      <div className="h-8 w-px bg-gray-500"></div>
                      <div>
                        <p className="text-[10px] text-gray-400 mb-0.5">Fecha</p>
                        <p className="text-base font-bold text-white">{new Date(sorteo.fecha_sorteo).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}</p>
                      </div>
                      <div className="h-8 w-px bg-gray-500"></div>
                      <div>
                        <p className="text-[10px] text-gray-400 mb-0.5">Sorteo en</p>
                        <p className="text-base font-bold text-white">{getDaysRemaining(sorteo.fecha_sorteo)}d</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-4">
                    <button
                      onClick={() => navigate(`/sorteo/${sorteo.id}`)}
                      className="px-6 py-2.5 md:px-8 md:py-4 bg-green-500 text-black text-sm md:text-base font-bold rounded-full hover:bg-green-400 transition-all transform hover:scale-105 shadow-2xl shadow-green-500/50"
                    >
                      🎯 Comprar Tickets
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Slider Controls - Ocultos en móvil */}
        <div className="hidden md:flex absolute bottom-8 left-1/2 transform -translate-x-1/2 space-x-3 z-10">
          {sorteos.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide
                  ? 'bg-white w-12'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>

        {/* Navigation Arrows - Solo Desktop */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + sorteos.length) % sorteos.length)}
          className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center bg-black/40 backdrop-blur-xl border border-gray-700/50 rounded-full text-white hover:bg-black/60 hover:border-green-500/50 transition-all z-10"
        >
          ‹
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % sorteos.length)}
          className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center bg-black/40 backdrop-blur-xl border border-gray-700/50 rounded-full text-white hover:bg-black/60 hover:border-green-500/50 transition-all z-10"
        >
          ›
        </button>
      </section>

      {/* Sorteos Destacados */}
      <section className="relative z-10 px-4 lg:px-16 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-4xl font-bold text-white mb-2">🎁 Sorteos Activos</h2>
            <p className="text-gray-400">Participa y gana increíbles premios</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sorteos.slice(0, 3).map((sorteo) => (
            <div
              key={sorteo.id}
              className="group bg-black/40 backdrop-blur-xl rounded-3xl overflow-hidden border border-gray-700/50 hover:border-green-500/50 transition-all transform hover:scale-105 cursor-pointer"
              onClick={() => navigate(`/sorteo/${sorteo.id}`)}
            >
              {/* Imagen */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={sorteo.imagen_card_url || sorteo.imagen_url || sorteo.imagen}
                  alt={sorteo.nombre}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 px-3 py-1 bg-green-500 text-black text-sm font-bold rounded-full">
                  {getDaysRemaining(sorteo.fecha_sorteo)} días
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-2xl font-bold text-white mb-2">{sorteo.nombre}</h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{sorteo.descripcion}</p>

                {/* Stats */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Precio</p>
                    <p className="text-xl font-bold text-green-400">{formatCurrency(sorteo.precio_ticket)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Vendidos</p>
                    <p className="text-xl font-bold text-white">{calculateProgress(sorteo.tickets_vendidos, sorteo.tickets_disponibles)}%</p>
                  </div>
                </div>

                {/* Progress */}
                <div className="w-full bg-gray-700/50 rounded-full h-2 mb-4">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                    style={{ width: `${calculateProgress(sorteo.tickets_vendidos, sorteo.tickets_disponibles)}%` }}
                  ></div>
                </div>

                <button className="w-full py-3 bg-green-500 text-black font-bold rounded-full hover:bg-green-400 transition-all">
                  Comprar Tickets
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ¿Cómo Funciona? */}
      <section className="relative z-10 px-4 lg:px-16 py-16">
        <h2 className="text-4xl font-bold text-white text-center mb-12">
          ✨ ¿Cómo Participar?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="text-center bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 hover:border-green-500/50 transition-all">
            <div className="w-20 h-20 bg-green-500 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-4 transform hover:rotate-12 transition-transform">
              1️⃣
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Elige tu Sorteo</h3>
            <p className="text-gray-400">Selecciona el premio que más te guste</p>
          </div>

          <div className="text-center bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 hover:border-green-500/50 transition-all">
            <div className="w-20 h-20 bg-green-500 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-4 transform hover:rotate-12 transition-transform">
              2️⃣
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Compra Tickets</h3>
            <p className="text-gray-400">Adquiere tus números de la suerte</p>
          </div>

          <div className="text-center bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 hover:border-green-500/50 transition-all">
            <div className="w-20 h-20 bg-green-500 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-4 transform hover:rotate-12 transition-transform">
              3️⃣
            </div>
            <h3 className="text-xl font-bold text-white mb-2">¡Gana!</h3>
            <p className="text-gray-400">Espera el sorteo y cruza los dedos 🤞</p>
          </div>
        </div>
      </section>

      {/* Testimonios / Ganadores */}
      <section className="relative z-10 px-4 lg:px-16 py-16">
        <h2 className="text-4xl font-bold text-white text-center mb-12">
          🏆 Ellos Ya Ganaron
        </h2>

        <div className="relative overflow-hidden">
          <div className="flex animate-scroll space-x-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="flex-shrink-0 w-64 bg-black/40 backdrop-blur-xl rounded-3xl p-6 border border-gray-700/50 hover:border-green-500/50 transition-all"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-400 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl">
                  👤
                </div>
                <h4 className="text-white font-bold text-center mb-2">Juan P.</h4>
                <p className="text-gray-400 text-sm text-center mb-4">Ganó: iPhone 15 Pro</p>
                <div className="flex justify-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="text-yellow-400">⭐</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="relative z-10 px-4 lg:px-16 py-20 text-center">
        <div className="max-w-4xl mx-auto bg-black/40 backdrop-blur-xl rounded-3xl p-12 border border-gray-700/50">
          <h2 className="text-5xl font-black text-white mb-4">
            ¿Listo para Ganar?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Únete a miles de personas que ya están participando
          </p>
          <button
            onClick={() => navigate('/sorteos')}
            className="px-12 py-5 bg-green-500 text-black text-xl font-bold rounded-full hover:bg-green-400 transition-all transform hover:scale-105 shadow-2xl shadow-green-500/50"
          >
            🎯 Ver Todos los Sorteos
          </button>
        </div>
      </section>

      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
      `}</style>
    </div>
  );
}
