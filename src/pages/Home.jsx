import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sorteoService, testimoniosService } from '../services/api';
import Countdown from 'react-countdown';

export default function Home() {
  const [sorteoActivo, setSorteoActivo] = useState(null);
  const [testimonios, setTestimonios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [sorteosRes, testimoniosRes] = await Promise.all([
        sorteoService.getActivos(),
        testimoniosService.getParaHome()
      ]);
      
      if (sorteosRes.data.length > 0) {
        setSorteoActivo(sorteosRes.data[0]);
      }
      setTestimonios(testimoniosRes.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section con Banner Principal */}
      <section className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                ¡Gana Premios Increíbles!
              </h1>
              <p className="text-xl mb-8">
                Participa en nuestros sorteos y llévate autos, motos y mucho más.
                100% transparente y confiable.
              </p>
              {sorteoActivo && (
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6">
                  <h3 className="text-2xl font-bold mb-4">Próximo Sorteo</h3>
                  <p className="text-lg mb-2">{sorteoActivo.nombre}</p>
                  <p className="text-sm mb-4">
                    {new Date(sorteoActivo.fecha_sorteo).toLocaleDateString('es-PE', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })} a las {sorteoActivo.hora_sorteo}
                  </p>
                  <div className="text-3xl font-bold">
                    <Countdown
                      date={new Date(`${sorteoActivo.fecha_sorteo}T${sorteoActivo.hora_sorteo}`)}
                      renderer={({ days, hours, minutes, seconds }) => (
                        <div className="grid grid-cols-4 gap-4 text-center">
                          <div>
                            <div className="text-4xl">{days}</div>
                            <div className="text-xs">Días</div>
                          </div>
                          <div>
                            <div className="text-4xl">{hours}</div>
                            <div className="text-xs">Horas</div>
                          </div>
                          <div>
                            <div className="text-4xl">{minutes}</div>
                            <div className="text-xs">Min</div>
                          </div>
                          <div>
                            <div className="text-4xl">{seconds}</div>
                            <div className="text-xs">Seg</div>
                          </div>
                        </div>
                      )}
                    />
                  </div>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/participar" className="btn btn-primary bg-white text-primary-600 hover:bg-gray-100 text-center text-lg px-8 py-4">
                  Participar Ahora
                </Link>
                <Link to="/premios" className="btn btn-secondary border-2 border-white text-white hover:bg-white/10 text-center text-lg px-8 py-4">
                  Ver Premios
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <img
                src="/premio-principal.jpg"
                alt="Premio Principal"
                className="rounded-lg shadow-2xl"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/600x400?text=Premio+Principal';
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Cómo Participar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12">¿Cómo Participar?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card text-center">
            <div className="text-5xl mb-4">1️⃣</div>
            <h3 className="text-xl font-bold mb-2">Selecciona tu Sorteo</h3>
            <p className="text-gray-600">
              Elige el sorteo en el que quieres participar y selecciona la cantidad de tickets.
            </p>
          </div>
          <div className="card text-center">
            <div className="text-5xl mb-4">2️⃣</div>
            <h3 className="text-xl font-bold mb-2">Realiza tu Pago</h3>
            <p className="text-gray-600">
              Paga mediante YAPE, PLIN o transferencia bancaria y sube tu comprobante.
            </p>
          </div>
          <div className="card text-center">
            <div className="text-5xl mb-4">3️⃣</div>
            <h3 className="text-xl font-bold mb-2">Recibe tus Números</h3>
            <p className="text-gray-600">
              Confirmaremos tu compra y recibirás tus números de rifas por WhatsApp.
            </p>
          </div>
        </div>
      </section>

      {/* Métodos de Pago */}
      <section className="bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8">Métodos de Pago</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-bold mb-2">YAPE</h3>
              <p className="text-2xl font-mono mb-2">999 999 999</p>
              <p className="text-sm text-gray-600">Sistema de Rifas</p>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-4">💳</div>
              <h3 className="text-xl font-bold mb-2">PLIN</h3>
              <p className="text-2xl font-mono mb-2">999 999 999</p>
              <p className="text-sm text-gray-600">Sistema de Rifas</p>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-4">🏦</div>
              <h3 className="text-xl font-bold mb-2">Transferencia</h3>
              <p className="text-sm font-mono mb-2">BCP: 123-456-789</p>
              <p className="text-sm text-gray-600">Sistema de Rifas</p>
            </div>
          </div>
          <div className="text-center mt-8">
            <p className="text-gray-600 mb-4">
              ⚠️ No olvides tomar captura de tu pago antes de completar el formulario
            </p>
            <Link to="/participar" className="btn btn-primary">
              Ya tengo mi captura de pago
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonios */}
      {testimonios.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Lo que dicen nuestros ganadores</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonios.slice(0, 3).map((testimonio) => (
              <div key={testimonio.id} className="card">
                <div className="flex items-center mb-4">
                  <img
                    src={testimonio.foto_url || 'https://via.placeholder.com/50'}
                    alt={testimonio.nombre}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h4 className="font-bold">{testimonio.nombre}</h4>
                    <div className="text-yellow-500">
                      {'⭐'.repeat(testimonio.rating)}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 italic">"{testimonio.testimonio}"</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA Final */}
      <section className="bg-primary-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">¿Listo para Ganar?</h2>
          <p className="text-xl mb-8">
            Únete a miles de participantes y ten la oportunidad de ganar increíbles premios
          </p>
          <Link to="/participar" className="btn btn-primary bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-4">
            Participar Ahora
          </Link>
        </div>
      </section>
    </div>
  );
}
