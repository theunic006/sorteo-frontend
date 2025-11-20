import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://5.189.180.242:8087/api';

export default function DetalleSorteo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sorteo, setSorteo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Estados para el formulario de registro
  const [enviando, setEnviando] = useState(false);
  const [formData, setFormData] = useState({
    dni: '',
    nombre: '',
    celular: '',
    email: '',
    departamento: '',
    direccion: '',
    cantidad_tickets: 1,
    comprobante: null,
    aceptoTerminos: false
  });
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});

  const departamentos = [
    'Amazonas', 'Áncash', 'Apurímac', 'Arequipa', 'Ayacucho', 'Cajamarca',
    'Callao', 'Cusco', 'Huancavelica', 'Huánuco', 'Ica', 'Junín', 'La Libertad',
    'Lambayeque', 'Lima', 'Loreto', 'Madre de Dios', 'Moquegua', 'Pasco', 'Piura',
    'Puno', 'San Martín', 'Tacna', 'Tumbes', 'Ucayali'
  ];

  useEffect(() => {
    loadSorteo();
  }, [id]);

  useEffect(() => {
    if (sorteo) {
      const interval = setInterval(() => {
        calculateTimeRemaining();
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [sorteo]);

  const loadSorteo = async () => {
    try {
      const response = await axios.get(`${API_URL}/sorteo/${id}`);
      setSorteo(response.data.data);
    } catch (error) {
      console.error('Error al cargar sorteo:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const calculateTimeRemaining = () => {
    if (!sorteo) return;

    // Extraer solo la fecha sin la hora (formato: "2025-12-03T00:00:00.000000Z")
    const fechaSorteo = sorteo.fecha_sorteo.split('T')[0]; // "2025-12-03"
    const horaSorteo = sorteo.hora_sorteo || '20:00:00'; // "20:00:00"
    
    // Crear la fecha combinada en formato ISO
    const sorteoDateTime = new Date(`${fechaSorteo}T${horaSorteo}`);
    const now = new Date();
    const diff = sorteoDateTime - now;

    if (diff > 0) {
      setTimeRemaining({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60)
      });
    } else {
      setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, comprobante: 'El archivo no debe superar los 5MB' }));
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        setErrors(prev => ({ ...prev, comprobante: 'Solo se aceptan archivos JPG o PNG' }));
        return;
      }
      
      setFormData(prev => ({ ...prev, comprobante: file }));
      setErrors(prev => ({ ...prev, comprobante: null }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.dni || formData.dni.length < 8) {
      newErrors.dni = 'DNI debe tener al menos 8 dígitos';
    }
    if (!formData.nombre || formData.nombre.length < 3) {
      newErrors.nombre = 'Nombre completo es requerido';
    }
    if (!formData.celular || formData.celular.length < 9) {
      newErrors.celular = 'Celular debe tener al menos 9 dígitos';
    }
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    if (!formData.departamento) {
      newErrors.departamento = 'Selecciona un departamento';
    }
    if (formData.cantidad_tickets < 1 || formData.cantidad_tickets > sorteo.tickets_restantes) {
      newErrors.cantidad_tickets = `Cantidad inválida (máx: ${sorteo.tickets_restantes})`;
    }
    if (!formData.comprobante) {
      newErrors.comprobante = 'Debes subir el comprobante de pago';
    }
    if (!formData.aceptoTerminos) {
      newErrors.aceptoTerminos = 'Debes aceptar los términos y condiciones';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setEnviando(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('sorteo_id', id);
      formDataToSend.append('dni', formData.dni);
      formDataToSend.append('nombre', formData.nombre);
      formDataToSend.append('celular', formData.celular);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('departamento', formData.departamento);
      formDataToSend.append('direccion', formData.direccion);
      formDataToSend.append('cantidad_tickets', formData.cantidad_tickets);
      formDataToSend.append('comprobante', formData.comprobante);
      formDataToSend.append('monto_total', sorteo.precio_ticket * formData.cantidad_tickets);

      const response = await axios.post(`${API_URL}/participar`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        alert('¡Registro exitoso! Pronto recibirás la confirmación de tus números.');
        navigate('/');
      }
    } catch (error) {
      console.error('Error al enviar registro:', error);
      setErrors({ general: 'Error al procesar tu registro. Intenta nuevamente.' });
    } finally {
      setEnviando(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-500 mx-auto"></div>
          <p className="text-white mt-4">Cargando sorteo...</p>
        </div>
      </div>
    );
  }

  if (!sorteo) {
    return null;
  }

  const images = sorteo.premios.map(p => p.imagen).filter(Boolean);
  if (sorteo.imagen && !images.includes(sorteo.imagen)) {
    images.unshift(sorteo.imagen);
  }

  return (
    <div className="min-h-screen pb-20 px-4 lg:px-16">

      <div className="mb-6 flex items-center gap-2 px-4 py-3 rounded-full transition-all">
        
      </div>

      {/* Grid de 2 Columnas Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* COLUMNA IZQUIERDA */}
        <div className="space-y-8">
          {/* Header del sorteo */}
          <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50">
            {/* Título, Descripción y Cuenta Regresiva */}
            <div className="mb-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                <div className="flex-1">
                  <h1 className="text-4xl font-black text-white mb-3">{sorteo.nombre}</h1>
                  <p className="text-gray-300 text-lg">{sorteo.descripcion}</p>
                </div>
                
                {/* Cuenta Regresiva */}
                <div className="bg-black/60 rounded-2xl p-4 border border-gray-700/50 min-w-fit self-start">
                  <p className="text-xs text-gray-400 text-center mb-2">Tiempo restante</p>
                  <div className="flex gap-2">
                    <div className="text-center">
                      <div className="bg-green-500/20 rounded-lg px-3 py-2 min-w-[50px]">
                        <p className="text-2xl font-black text-green-400">{timeRemaining.days}</p>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">Días</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-green-500/20 rounded-lg px-3 py-2 min-w-[50px]">
                        <p className="text-2xl font-black text-green-400">{String(timeRemaining.hours).padStart(2, '0')}</p>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">Hrs</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-green-500/20 rounded-lg px-3 py-2 min-w-[50px]">
                        <p className="text-2xl font-black text-green-400">{String(timeRemaining.minutes).padStart(2, '0')}</p>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">Min</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-green-500/20 rounded-lg px-3 py-2 min-w-[50px]">
                        <p className="text-2xl font-black text-green-400">{String(timeRemaining.seconds).padStart(2, '0')}</p>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">Seg</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid de 2 columnas: Imagen | Precio y Fecha */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1: Imagen */}
              <div className="bg-black/60 rounded-2xl overflow-hidden border border-gray-700/50">
                <img
                  src={sorteo.imagen_card_url || sorteo.imagen_url || sorteo.imagen}
                  alt={sorteo.nombre}
                  className="w-full h-full object-cover min-h-[250px]"
                />
              </div>

              {/* Card 2: Precio y Fecha */}
              <div className="bg-black/60 rounded-2xl p-6 border border-gray-700/50 flex flex-col justify-center space-y-6">
                {/* Precio del ticket */}
                <div className="flex items-center gap-4">
                  <div className="bg-green-500/20 rounded-xl p-3">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Precio por ticket</p>
                    <p className="text-3xl font-black text-green-400">{formatCurrency(sorteo.precio_ticket)}</p>
                  </div>
                </div>

                {/* Fecha del sorteo */}
                <div className="flex items-center gap-4">
                  <div className="bg-green-500/20 rounded-xl p-3">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Fecha del Sorteo</p>
                    <p className="text-xl font-bold text-white">
                      {new Date(sorteo.fecha_sorteo).toLocaleDateString('es-PE', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Métodos de Pago */}
          <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50">
            <h2 className="text-3xl font-bold text-white mb-6">💳 Métodos de Pago</h2>
            <div className="space-y-6">
              <div className="bg-black/60 rounded-2xl p-6 border border-gray-700/50">
                <h3 className="text-xl font-bold text-white mb-4">YAPE</h3>
                <div className="flex flex-col items-center">
                  <img 
                    src="/images/payment/yape-qr.png" 
                    alt="QR YAPE" 
                    className="w-80 h-80 object-contain mb-4 rounded-xl p-2"
                  />
                  <p className="text-gray-300 mb-2">Número de celular:</p>
                  <p className="text-2xl font-mono font-bold text-green-400">999 999 999</p>
                </div>
              </div>
              <div className="bg-black/60 rounded-2xl p-6 border border-gray-700/50">
                <h3 className="text-xl font-bold text-white mb-4">PLIN</h3>
                <div className="flex flex-col items-center">
                  <img 
                    src="/images/payment/plin-qr.png" 
                    alt="QR PLIN" 
                    className="w-80 h-80 object-contain mb-4 rounded-xl p-2"
                  />
                  <p className="text-gray-300 mb-2">Número de celular:</p>
                  <p className="text-2xl font-mono font-bold text-green-400">999 999 999</p>
                </div>
              </div>
            </div>            frontend/
            ├── public/
            │   └── images/
            │       └── payment/
            │           ├── yape-qr.png
            │           └── plin-qr.png
               
            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl">
              <p className="text-yellow-400 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Importante: Toma captura de pantalla de tu pago antes de continuar con el registro
              </p>
            </div>
          </div>

        </div>

        {/* COLUMNA DERECHA - Formulario de Registro */}
        <form onSubmit={handleSubmit} className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 h-fit lg:sticky lg:top-4">
        <h2 className="text-3xl font-bold text-white mb-6">📋 Registro de Participación</h2>
        
        {errors.general && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl">
            <p className="text-red-400">{errors.general}</p>
          </div>
        )}

        {/* Datos Personales */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-white mb-4">Datos Personales</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white font-semibold mb-2">DNI *</label>
              <input
                type="text"
                name="dni"
                value={formData.dni}
                onChange={handleChange}
                placeholder="12345678"
                maxLength="8"
                className={`w-full px-4 py-3 bg-black/60 border ${errors.dni ? 'border-red-500' : 'border-gray-700/50'} rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-green-500`}
              />
              {errors.dni && <p className="text-red-400 text-sm mt-1">{errors.dni}</p>}
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">Celular *</label>
              <div className="flex items-center">
                <span className="px-4 py-3 bg-gray-700/50 border border-r-0 border-gray-700/50 rounded-l-2xl text-white font-medium">
                  +51
                </span>
                <input
                  type="text"
                  name="celular"
                  value={formData.celular}
                  onChange={handleChange}
                  placeholder="999999999"
                  maxLength="9"
                  className={`flex-1 px-4 py-3 bg-black/60 border ${errors.celular ? 'border-red-500' : 'border-gray-700/50'} rounded-r-2xl text-white focus:outline-none focus:ring-2 focus:ring-green-500`}
                />
              </div>
              {errors.celular && <p className="text-red-400 text-sm mt-1">{errors.celular}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-white font-semibold mb-2">Nombre Completo *</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Juan Pérez García"
                className={`w-full px-4 py-3 bg-black/60 border ${errors.nombre ? 'border-red-500' : 'border-gray-700/50'} rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-green-500`}
              />
              {errors.nombre && <p className="text-red-400 text-sm mt-1">{errors.nombre}</p>}
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="correo@ejemplo.com"
                className={`w-full px-4 py-3 bg-black/60 border ${errors.email ? 'border-red-500' : 'border-gray-700/50'} rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-green-500`}
              />
              {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">Departamento *</label>
              <select
                name="departamento"
                value={formData.departamento}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-black/60 border ${errors.departamento ? 'border-red-500' : 'border-gray-700/50'} rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-green-500`}
              >
                <option value="">Selecciona...</option>
                {departamentos.map((dep) => (
                  <option key={dep} value={dep}>{dep}</option>
                ))}
              </select>
              {errors.departamento && <p className="text-red-400 text-sm mt-1">{errors.departamento}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-white font-semibold mb-2">Dirección (Opcional)</label>
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                placeholder="Av. Principal 123"
                className="w-full px-4 py-3 bg-black/60 border border-gray-700/50 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        {/* Cantidad de Tickets */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-white mb-4">Cantidad de Tickets</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white font-semibold mb-2">Cantidad *</label>
              <input
                type="number"
                name="cantidad_tickets"
                value={formData.cantidad_tickets}
                onChange={handleChange}
                min="1"
                max={sorteo.tickets_restantes}
                className={`w-full px-4 py-3 bg-black/60 border ${errors.cantidad_tickets ? 'border-red-500' : 'border-gray-700/50'} rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-green-500`}
              />
              {errors.cantidad_tickets && <p className="text-red-400 text-sm mt-1">{errors.cantidad_tickets}</p>}
            </div>

            <div className="bg-black/60 rounded-2xl p-4 border border-gray-700/50 flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm text-gray-400">Total a Pagar</p>
                <p className="text-3xl font-bold text-green-400">
                  {formatCurrency(sorteo.precio_ticket * formData.cantidad_tickets)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Comprobante de Pago */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-white mb-4">Comprobante de Pago</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white font-semibold mb-2">Subir Comprobante *</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={handleFileChange}
                className="hidden"
                id="comprobante-upload"
              />
              <label
                htmlFor="comprobante-upload"
                className={`block w-full px-4 py-8 bg-black/60 border-2 border-dashed ${errors.comprobante ? 'border-red-500' : 'border-gray-700/50'} rounded-2xl text-center cursor-pointer hover:border-green-500/50 transition-all`}
              >
                <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-white font-semibold">Click para subir imagen</p>
                <p className="text-sm text-gray-400 mt-1">JPG o PNG (máx. 5MB)</p>
              </label>
              {errors.comprobante && <p className="text-red-400 text-sm mt-1">{errors.comprobante}</p>}
            </div>

            {preview && (
              <div className="bg-black/60 rounded-2xl p-4 border border-gray-700/50">
                <p className="text-white font-semibold mb-2">Vista Previa</p>
                <img
                  src={preview}
                  alt="Comprobante"
                  className="w-full h-48 object-cover rounded-xl"
                />
              </div>
            )}
          </div>
        </div>

        {/* Términos y Condiciones */}
        <div className="mb-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="aceptoTerminos"
              checked={formData.aceptoTerminos}
              onChange={handleChange}
              className="mt-1"
            />
            <span className="text-white">
              Acepto los términos y condiciones. Confirmo que la información proporcionada es correcta y que he realizado el pago correspondiente.
            </span>
          </label>
          {errors.aceptoTerminos && <p className="text-red-400 text-sm mt-1">{errors.aceptoTerminos}</p>}
        </div>

        {/* Botón Enviar */}
        <button
          type="submit"
          disabled={enviando}
          className="w-full py-4 bg-green-500 text-black text-lg font-bold rounded-full hover:bg-green-400 transition-all transform hover:scale-105 shadow-2xl shadow-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {enviando ? 'Enviando...' : '🎯 Confirmar Participación'}
        </button>
      </form>
      </div>

      {/* Premios */}
      <div className="mt-12">
        <h2 className="text-3xl font-bold text-white mb-6">🏆 Premios del Sorteo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sorteo.premios.map((premio) => (
            <div
              key={premio.id}
              className="bg-black/40 backdrop-blur-xl rounded-3xl overflow-hidden border border-gray-700/50 hover:border-green-500/50 transition-all"
            >
              {premio.imagen && (
                <div className="h-48 overflow-hidden">
                  <img
                    src={premio.imagen}
                    alt={premio.descripcion}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="inline-block px-3 py-1 bg-green-500 text-black text-sm font-bold rounded-full mb-3">
                  {premio.posicion}° Puesto
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{premio.descripcion}</h3>
                {premio.valor && (
                  <p className="text-2xl font-bold text-green-400">
                    Valor: {formatCurrency(premio.valor)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
