import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:8087/api';

export default function Participar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sorteo, setSorteo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paso, setPaso] = useState(1); // 1: Datos, 2: Tickets, 3: Comprobante, 4: Confirmación
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Limpiar error del campo
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
      
      // Vista previa
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validatePaso1 = () => {
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
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePaso2 = () => {
    const newErrors = {};
    
    if (formData.cantidad_tickets < 1 || formData.cantidad_tickets > sorteo.tickets_restantes) {
      newErrors.cantidad_tickets = `Cantidad inválida (máx: ${sorteo.tickets_restantes})`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePaso3 = () => {
    const newErrors = {};
    
    if (!formData.comprobante) {
      newErrors.comprobante = 'Debes subir el comprobante de pago';
    }
    if (!formData.aceptoTerminos) {
      newErrors.aceptoTerminos = 'Debes aceptar los términos y condiciones';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextPaso = () => {
    let valid = false;
    
    if (paso === 1) valid = validatePaso1();
    else if (paso === 2) valid = validatePaso2();
    else if (paso === 3) valid = validatePaso3();
    
    if (valid) {
      setPaso(paso + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async () => {
    if (!validatePaso3()) return;

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

      // TODO: Crear endpoint en backend para procesar la compra
      const response = await axios.post(`${API_URL}/participar`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setPaso(4);
        // Aquí se debería mostrar los números de tickets asignados
      }
    } catch (error) {
      console.error('Error al enviar registro:', error);
      setErrors({ general: 'Error al procesar tu registro. Intenta nuevamente.' });
    } finally {
      setEnviando(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-500 mx-auto"></div>
          <p className="text-white mt-4">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-white mb-4">🎯 Participa Ahora</h1>
          <p className="text-xl text-gray-300">{sorteo?.nombre}</p>
        </div>

        {/* Indicador de pasos */}
        <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-6 border border-gray-700/50 mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="flex items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  paso >= num ? 'bg-green-500 text-black' : 'bg-gray-700 text-gray-400'
                }`}>
                  {num}
                </div>
                {num < 4 && (
                  <div className={`flex-1 h-1 mx-2 ${paso > num ? 'bg-green-500' : 'bg-gray-700'}`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span className={paso >= 1 ? 'text-green-400' : 'text-gray-400'}>Datos</span>
            <span className={paso >= 2 ? 'text-green-400' : 'text-gray-400'}>Tickets</span>
            <span className={paso >= 3 ? 'text-green-400' : 'text-gray-400'}>Pago</span>
            <span className={paso >= 4 ? 'text-green-400' : 'text-gray-400'}>Confirmación</span>
          </div>
        </div>

        {/* Paso 1: Datos personales */}
        {paso === 1 && (
          <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50">
            <h2 className="text-2xl font-bold text-white mb-6">📋 Tus Datos Personales</h2>
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
                  {departamentos.map(dep => (
                    <option key={dep} value={dep}>{dep}</option>
                  ))}
                </select>
                {errors.departamento && <p className="text-red-400 text-sm mt-1">{errors.departamento}</p>}
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">Dirección (opcional)</label>
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

            <button
              onClick={handleNextPaso}
              className="w-full mt-8 py-4 bg-green-500 text-black text-lg font-bold rounded-full hover:bg-green-400 transition-all"
            >
              Continuar →
            </button>
          </div>
        )}

        {/* Paso 2: Selección de tickets */}
        {paso === 2 && (
          <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50">
            <h2 className="text-2xl font-bold text-white mb-6">🎫 ¿Cuántos tickets quieres?</h2>
            
            <div className="bg-black/60 rounded-2xl p-6 border border-gray-700/50 mb-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-400">Precio unitario</p>
                  <p className="text-2xl font-bold text-green-400">{formatCurrency(sorteo.precio_ticket)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Tickets disponibles</p>
                  <p className="text-2xl font-bold text-white">{sorteo.tickets_restantes}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total a pagar</p>
                  <p className="text-2xl font-bold text-green-400">
                    {formatCurrency(sorteo.precio_ticket * formData.cantidad_tickets)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-white font-semibold mb-4">Cantidad de tickets</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    cantidad_tickets: Math.max(1, prev.cantidad_tickets - 1)
                  }))}
                  className="w-12 h-12 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-all text-xl"
                >
                  -
                </button>
                <input
                  type="number"
                  name="cantidad_tickets"
                  value={formData.cantidad_tickets}
                  onChange={handleChange}
                  min="1"
                  max={sorteo.tickets_restantes}
                  className="flex-1 px-6 py-4 bg-black/60 border border-gray-700/50 rounded-2xl text-white text-center text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    cantidad_tickets: Math.min(sorteo.tickets_restantes, prev.cantidad_tickets + 1)
                  }))}
                  className="w-12 h-12 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-all text-xl"
                >
                  +
                </button>
              </div>
              {errors.cantidad_tickets && <p className="text-red-400 text-sm mt-2">{errors.cantidad_tickets}</p>}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setPaso(1)}
                className="flex-1 py-4 bg-gray-700 text-white font-bold rounded-full hover:bg-gray-600 transition-all"
              >
                ← Atrás
              </button>
              <button
                onClick={handleNextPaso}
                className="flex-1 py-4 bg-green-500 text-black font-bold rounded-full hover:bg-green-400 transition-all"
              >
                Continuar →
              </button>
            </div>
          </div>
        )}

        {/* Paso 3: Comprobante de pago */}
        {paso === 3 && (
          <div className="space-y-6">
            {/* Métodos de pago */}
            <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50">
              <h2 className="text-2xl font-bold text-white mb-6">💳 Realiza tu pago</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-black/60 rounded-2xl p-6 border border-gray-700/50">
                  <h3 className="text-xl font-bold text-white mb-4">YAPE</h3>
                  <p className="text-gray-300 mb-2">Número:</p>
                  <p className="text-2xl font-mono font-bold text-green-400">999 999 999</p>
                </div>
                <div className="bg-black/60 rounded-2xl p-6 border border-gray-700/50">
                  <h3 className="text-xl font-bold text-white mb-4">PLIN</h3>
                  <div className="w-32 h-32 bg-white rounded-xl mx-auto"></div>
                </div>
              </div>
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl">
                <p className="text-yellow-400 text-sm">
                  ⚠️ Importante: Realiza el pago por <strong>{formatCurrency(sorteo.precio_ticket * formData.cantidad_tickets)}</strong> y toma captura de pantalla
                </p>
              </div>
            </div>

            {/* Subir comprobante */}
            <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50">
              <h2 className="text-2xl font-bold text-white mb-6">📸 Sube tu comprobante</h2>
              
              <div className="mb-6">
                <label className="block w-full">
                  <div className={`border-2 border-dashed ${errors.comprobante ? 'border-red-500' : 'border-gray-700'} rounded-2xl p-8 text-center cursor-pointer hover:border-green-500 transition-all`}>
                    {preview ? (
                      <div>
                        <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-lg mb-4" />
                        <p className="text-green-400">Comprobante cargado ✓</p>
                      </div>
                    ) : (
                      <div>
                        <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-white font-semibold mb-2">Click para subir comprobante</p>
                        <p className="text-gray-400 text-sm">JPG o PNG (máx. 5MB)</p>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                {errors.comprobante && <p className="text-red-400 text-sm mt-2">{errors.comprobante}</p>}
              </div>

              <div className="mb-6">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="aceptoTerminos"
                    checked={formData.aceptoTerminos}
                    onChange={handleChange}
                    className="mt-1"
                  />
                  <span className="text-gray-300">
                    Acepto los <a href="#" className="text-green-400 hover:underline">términos y condiciones</a> y las <a href="#" className="text-green-400 hover:underline">políticas de privacidad</a>
                  </span>
                </label>
                {errors.aceptoTerminos && <p className="text-red-400 text-sm mt-2">{errors.aceptoTerminos}</p>}
              </div>

              {errors.general && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl">
                  <p className="text-red-400">{errors.general}</p>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => setPaso(2)}
                  className="flex-1 py-4 bg-gray-700 text-white font-bold rounded-full hover:bg-gray-600 transition-all"
                  disabled={enviando}
                >
                  ← Atrás
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={enviando}
                  className="flex-1 py-4 bg-green-500 text-black font-bold rounded-full hover:bg-green-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {enviando ? 'Procesando...' : 'Confirmar Compra ✓'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Paso 4: Confirmación */}
        {paso === 4 && (
          <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-12 border border-gray-700/50 text-center">
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-4xl font-black text-white mb-4">¡Registro Exitoso!</h2>
            <p className="text-xl text-gray-300 mb-8">
              Tu compra ha sido registrada correctamente
            </p>

            <div className="bg-black/60 rounded-2xl p-6 border border-gray-700/50 mb-8">
              <h3 className="text-lg font-bold text-white mb-4">Tus números de la suerte:</h3>
              <div className="flex flex-wrap gap-3 justify-center">
                {/* TODO: Mostrar números reales asignados */}
                <div className="px-6 py-3 bg-green-500 text-black font-mono font-bold text-xl rounded-full">
                  100001
                </div>
                {formData.cantidad_tickets > 1 && (
                  <div className="px-6 py-3 bg-green-500 text-black font-mono font-bold text-xl rounded-full">
                    100002
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4 text-gray-300 mb-8">
              <p>✓ Hemos enviado un mensaje de confirmación a tu WhatsApp</p>
              <p>✓ Recibirás un correo con los detalles de tu compra</p>
              <p>✓ Puedes consultar tus números en cualquier momento con tu DNI</p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => navigate('/consulta-tickets')}
                className="flex-1 py-4 bg-gray-700 text-white font-bold rounded-full hover:bg-gray-600 transition-all"
              >
                Ver mis Tickets
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex-1 py-4 bg-green-500 text-black font-bold rounded-full hover:bg-green-400 transition-all"
              >
                Volver al Inicio
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
