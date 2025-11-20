import { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';

export default function PublicLayout() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { id: 'inicio', name: 'Inicio', path: '/', icon: '⛺', iconSvg: true },
    { id: 'sorteos', name: 'Sorteos', path: '/', icon: '🎁' },
    { id: 'premios', name: 'Premios', path: '/#premios', icon: '📦' },
    { id: 'ganadores', name: 'Ganadores', path: '/ganadores', icon: '🏆' },
    { id: 'consulta', name: 'Consulta Tickets', path: '/consulta-tickets', icon: '🎫' },
    { id: 'contacto', name: 'Contacto', path: 'https://wa.me/51999999999', icon: '📞' },
  ];

  const extrasItems = [
    { id: 'philantropia', name: 'Philantropía', path: '/philantropia', icon: '🤝' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Background espacial animado */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-black"></div>
        <div className="stars"></div>
        <div className="twinkling"></div>
      </div>

      {/* Sidebar Flotante - Solo Desktop y Tablet */}
        <aside 
          className={`hidden md:block fixed top-0 left-4 z-40 transition-all duration-300 ${
            sidebarExpanded ? 'w-64' : 'w-20'
          }`}
          onMouseEnter={() => setSidebarExpanded(true)}
          onMouseLeave={() => setSidebarExpanded(false)}
          style={{ marginTop: '8rem' }}
        >
          <div className="flex flex-col bg-black/70 backdrop-blur-2xl rounded-[2.5rem] border border-gray-800/50 shadow-2xl overflow-hidden">
            {/* Logo */}
          <div className="p-6 border-b border-gray-800/50">
            <div className="flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl flex-shrink-0">
                🎰
              </div>
              {sidebarExpanded && (
                <div className="ml-3 overflow-hidden opacity-100 transition-opacity duration-300">
                  <h1 className="text-xl font-bold text-white whitespace-nowrap">
                    FlordeOro
                  </h1>
                </div>
              )}
            </div>
          </div>

          {/* Menú Principal */}
          <nav className="flex-1 py-6 space-y-1 overflow-y-auto scrollbar-hide">
            {menuItems.map((item, index) => (
              <Link
                key={item.id}
                to={item.path}
                className={`flex items-center px-4 mx-2 py-3 text-gray-300 transition-all group relative ${
                  index === 0 
                    ? 'bg-green-500 text-black hover:bg-green-400 hover:text-black rounded-full' 
                    : 'hover:bg-white/5 hover:text-green-400 rounded-2xl'
                }`}
              >
                <div className="w-6 h-6 flex items-center justify-center text-xl flex-shrink-0">
                  {item.icon}
                </div>
                {sidebarExpanded && (
                  <span className="ml-4 font-medium whitespace-nowrap opacity-100 transition-opacity duration-300">
                    {item.name}
                  </span>
                )}
                {!sidebarExpanded && index !== 0 && (
                  <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {item.name}
                  </div>
                )}
              </Link>
            ))}

            {/* Extras Section */}
            {sidebarExpanded && (
              <div className="px-4 pt-6 pb-2">
                <p className="text-xs font-bold text-white">Extras</p>
              </div>
            )}
            {!sidebarExpanded && (
              <div className="px-4 pt-6 pb-2">
                <div className="h-px bg-gray-800/50"></div>
              </div>
            )}
            {extrasItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className="flex items-center px-4 mx-2 py-3 text-gray-300 hover:bg-white/5 hover:text-green-400 transition-all group rounded-2xl relative"
              >
                <div className="w-6 h-6 flex items-center justify-center text-xl flex-shrink-0">
                  {item.icon}
                </div>
                {sidebarExpanded && (
                  <span className="ml-4 font-medium whitespace-nowrap opacity-100 transition-opacity duration-300">
                    {item.name}
                  </span>
                )}
                {!sidebarExpanded && (
                  <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {item.name}
                  </div>
                )}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Bottom Navigation - Solo Móvil */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 z-40 bg-black/80 backdrop-blur-2xl rounded-3xl border border-gray-800/50 shadow-2xl">
        <div className="flex items-center justify-around px-4 py-3">
          {menuItems.slice(0, 5).map((item, index) => (
            <Link
              key={item.id}
              to={item.path}
              className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all ${
                index === 0 
                  ? 'bg-green-500 text-black shadow-lg shadow-green-500/50' 
                  : 'text-gray-400 hover:text-green-400'
              }`}
            >
              <div className="text-2xl mb-1">
                {item.icon}
              </div>
              <span className="text-[10px] font-medium">
                {item.name === 'Sorteos' ? 'Inicio' : item.name.split(' ')[0]}
              </span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Main Content - Sin margen fijo, el sidebar flota sobre el contenido */}
      <div className="w-full">
        {/* Page Content - Sin Header */}
        <main className="px-4 lg:px-16">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="relative z-10 mt-20 bg-black/40 backdrop-blur-xl border-t border-gray-700/50">
          <div className="px-4 md:px-12 lg:px-24 xl:px-32 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl">
                    🎰
                  </div>
                  <h3 className="ml-3 text-xl font-bold text-white">
                    P.ChuJoy
                  </h3>
                </div>
                <p className="text-gray-400 text-sm">
                  Un gran equipo enfocado en tu mejor experiencia.
                </p>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-4">Contacto</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>• Horario: 9:00 a 18:00</li>
                  <li>• <a href="#" className="hover:text-green-400">Contacto</a></li>
                  <li>• <a href="#" className="hover:text-green-400">Soporte</a></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4">General</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="text-gray-400 hover:text-green-400">• Términos y Condiciones</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-green-400">• Políticas de Privacidad</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-green-400">• Preguntas Frecuentes</a></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4">Síguenos en:</h4>
                <div className="flex space-x-3">
                  <a href="#" className="w-10 h-10 flex items-center justify-center bg-white/5 border border-gray-700/50 rounded-lg hover:bg-green-500/20 hover:border-green-500/50 transition-all text-xl">
                    🎵
                  </a>
                  <a href="#" className="w-10 h-10 flex items-center justify-center bg-white/5 border border-gray-700/50 rounded-lg hover:bg-green-500/20 hover:border-green-500/50 transition-all text-xl">
                    ▶️
                  </a>
                  <a href="#" className="w-10 h-10 flex items-center justify-center bg-white/5 border border-gray-700/50 rounded-lg hover:bg-green-500/20 hover:border-green-500/50 transition-all text-xl">
                    📷
                  </a>
                  <a href="#" className="w-10 h-10 flex items-center justify-center bg-white/5 border border-gray-700/50 rounded-lg hover:bg-green-500/20 hover:border-green-500/50 transition-all text-xl">
                    📘
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-700/50 text-center">
              <p className="text-sm text-gray-400">
                © 2025 P.ChuJoy. Todos los derechos reservados.
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Lima, Perú
              </p>
            </div>
          </div>
        </footer>
      </div>

      {/* Estilos para el fondo espacial */}
      <style>{`
        .stars {
          background: transparent url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Ccircle cx="10" cy="10" r="1" fill="white" opacity="0.3"/%3E%3Ccircle cx="150" cy="50" r="0.5" fill="white" opacity="0.5"/%3E%3Ccircle cx="80" cy="120" r="1" fill="white" opacity="0.4"/%3E%3Ccircle cx="180" cy="160" r="0.5" fill="white" opacity="0.6"/%3E%3C/svg%3E') repeat;
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 0;
        }

        .twinkling {
          background: transparent url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Ccircle cx="40" cy="60" r="1" fill="white"/%3E%3Ccircle cx="120" cy="30" r="0.5" fill="white"/%3E%3Ccircle cx="170" cy="100" r="1" fill="white"/%3E%3C/svg%3E') repeat;
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1;
          animation: twinkle 200s linear infinite;
        }

        @keyframes twinkle {
          from { transform: translateY(0); }
          to { transform: translateY(-10000px); }
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
