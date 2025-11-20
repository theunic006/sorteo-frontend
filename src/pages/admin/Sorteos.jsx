import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://5.189.180.242:8087/api';

export default function AdminSorteos() {
  const [sorteos, setSorteos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSorteo, setEditingSorteo] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    fecha_sorteo: '',
    hora_sorteo: '20:00',
    precio_ticket: '',
    tickets_disponibles: '',
    estado: 'pendiente'
  });
  const [imagenPreview, setImagenPreview] = useState(null);
  const [imagenCardPreview, setImagenCardPreview] = useState(null);
  const [imagenSliderPreview, setImagenSliderPreview] = useState(null);
  const [imagenFile, setImagenFile] = useState(null);
  const [imagenCardFile, setImagenCardFile] = useState(null);
  const [imagenSliderFile, setImagenSliderFile] = useState(null);

  useEffect(() => {
    loadSorteos();
  }, []);

  const loadSorteos = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${API_URL}/admin/sorteos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSorteos(response.data.data || []);
    } catch (error) {
      console.error('Error al cargar sorteos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('admin_token');
      
      // Crear FormData para enviar archivos
      const data = new FormData();
      data.append('nombre', formData.nombre);
      data.append('descripcion', formData.descripcion);
      data.append('fecha_sorteo', formData.fecha_sorteo);
      data.append('hora_sorteo', formData.hora_sorteo);
      data.append('precio_ticket', formData.precio_ticket);
      data.append('tickets_disponibles', formData.tickets_disponibles);
      data.append('estado', formData.estado);
      
      // Agregar imágenes si fueron seleccionadas
      if (imagenFile) {
        data.append('imagen', imagenFile);
      }
      if (imagenCardFile) {
        data.append('imagen_card', imagenCardFile);
      }
      if (imagenSliderFile) {
        data.append('imagen_slider', imagenSliderFile);
      }

      if (editingSorteo) {
        await axios.post(`${API_URL}/admin/sorteos/${editingSorteo.id}?_method=PUT`, data, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        await axios.post(`${API_URL}/admin/sorteos`, data, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      setShowModal(false);
      setEditingSorteo(null);
      setFormData({
        nombre: '',
        descripcion: '',
        fecha_sorteo: '',
        hora_sorteo: '20:00',
        precio_ticket: '',
        tickets_disponibles: '',
        estado: 'pendiente'
      });
      // Limpiar previsualizaciones
      setImagenPreview(null);
      setImagenCardPreview(null);
      setImagenSliderPreview(null);
      setImagenFile(null);
      setImagenCardFile(null);
      setImagenSliderFile(null);
      loadSorteos();
    } catch (error) {
      console.error('Error al guardar sorteo:', error);
      alert('Error al guardar el sorteo');
    }
  };

  const handleEdit = (sorteo) => {
    setEditingSorteo(sorteo);
    setFormData({
      nombre: sorteo.nombre,
      descripcion: sorteo.descripcion,
      fecha_sorteo: sorteo.fecha_sorteo.split('T')[0],
      hora_sorteo: sorteo.hora_sorteo || '20:00',
      precio_ticket: sorteo.precio_ticket,
      tickets_disponibles: sorteo.tickets_disponibles,
      estado: sorteo.estado
    });
    // Cargar previsualizaciones de imágenes existentes
    setImagenPreview(sorteo.imagen_url || null);
    setImagenCardPreview(sorteo.imagen_card_url || null);
    setImagenSliderPreview(sorteo.imagen_slider_url || null);
    setImagenFile(null);
    setImagenCardFile(null);
    setImagenSliderFile(null);
    setShowModal(true);
  };

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
        alert('Solo se permiten archivos PNG o JPG');
        return;
      }
      
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'imagen') {
          setImagenPreview(reader.result);
          setImagenFile(file);
        } else if (type === 'imagen_card') {
          setImagenCardPreview(reader.result);
          setImagenCardFile(file);
        } else if (type === 'imagen_slider') {
          setImagenSliderPreview(reader.result);
          setImagenSliderFile(file);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (type) => {
    if (type === 'imagen') {
      setImagenPreview(null);
      setImagenFile(null);
    } else if (type === 'imagen_card') {
      setImagenCardPreview(null);
      setImagenCardFile(null);
    } else if (type === 'imagen_slider') {
      setImagenSliderPreview(null);
      setImagenSliderFile(null);
    }
  };

  const handleActivar = async (id) => {
    try {
      const token = localStorage.getItem('admin_token');
      await axios.post(`${API_URL}/admin/sorteos/${id}/activar`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadSorteos();
    } catch (error) {
      console.error('Error al activar sorteo:', error);
      alert('Error al activar el sorteo');
    }
  };

  const handleFinalizar = async (id) => {
    if (!confirm('¿Estás seguro de finalizar este sorteo?')) return;
    try {
      const token = localStorage.getItem('admin_token');
      await axios.post(`${API_URL}/admin/sorteos/${id}/finalizar`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadSorteos();
    } catch (error) {
      console.error('Error al finalizar sorteo:', error);
      alert('Error al finalizar el sorteo');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este sorteo?')) return;
    try {
      const token = localStorage.getItem('admin_token');
      await axios.delete(`${API_URL}/admin/sorteos/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadSorteos();
    } catch (error) {
      console.error('Error al eliminar sorteo:', error);
      alert('Error al eliminar el sorteo');
    }
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      pendiente: 'bg-gray-100 text-gray-800',
      activo: 'bg-green-100 text-green-800',
      finalizado: 'bg-blue-100 text-blue-800',
      cancelado: 'bg-red-100 text-red-800'
    };
    return badges[estado] || badges.pendiente;
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
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Sorteos</h2>
          <p className="text-gray-600 mt-1">Administra los sorteos y sus configuraciones</p>
        </div>
        <button
          onClick={() => {
            setEditingSorteo(null);
            setFormData({
              nombre: '',
              descripcion: '',
              fecha_sorteo: '',
              hora_sorteo: '20:00',
              precio_ticket: '',
              tickets_disponibles: '',
              estado: 'pendiente'
            });
            setImagenPreview(null);
            setImagenCardPreview(null);
            setImagenSliderPreview(null);
            setImagenFile(null);
            setImagenCardFile(null);
            setImagenSliderFile(null);
            setShowModal(true);
          }}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Nuevo Sorteo</span>
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sorteo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tickets
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
              {sorteos.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No hay sorteos registrados. Crea uno nuevo para comenzar.
                  </td>
                </tr>
              ) : (
                sorteos.map((sorteo) => (
                  <tr key={sorteo.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{sorteo.nombre}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{sorteo.descripcion}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(sorteo.fecha_sorteo).toLocaleDateString('es-PE')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      S/ {sorteo.precio_ticket}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sorteo.tickets_vendidos || 0} / {sorteo.tickets_disponibles}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoBadge(sorteo.estado)}`}>
                        {sorteo.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {sorteo.estado === 'pendiente' && (
                          <button
                            onClick={() => handleActivar(sorteo.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Activar"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        )}
                        {sorteo.estado === 'activo' && (
                          <button
                            onClick={() => handleFinalizar(sorteo.id)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Finalizar"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(sorteo)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Editar"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(sorteo.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowModal(false)}></div>
            
            <div className="inline-block w-full max-w-2xl overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-xl">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                <h3 className="text-lg font-medium text-white">
                  {editingSorteo ? 'Editar Sorteo' : 'Nuevo Sorteo'}
                </h3>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del Sorteo
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej: Gran Sorteo Navideño 2025"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción
                    </label>
                    <textarea
                      required
                      value={formData.descripcion}
                      onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Describe el sorteo..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha del Sorteo
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.fecha_sorteo}
                      onChange={(e) => setFormData({ ...formData, fecha_sorteo: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hora del Sorteo
                    </label>
                    <input
                      type="time"
                      required
                      value={formData.hora_sorteo}
                      onChange={(e) => setFormData({ ...formData, hora_sorteo: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Precio por Ticket (S/)
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.precio_ticket}
                      onChange={(e) => setFormData({ ...formData, precio_ticket: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="10.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total de Tickets
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.tickets_disponibles}
                      onChange={(e) => setFormData({ ...formData, tickets_disponibles: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado
                    </label>
                    <select
                      value={formData.estado}
                      onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="activo">Activo</option>
                      <option value="finalizado">Finalizado</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </div>
                </div>

                {/* Sección de Imágenes en Grid 3 Columnas */}
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Imágenes del Sorteo</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {/* Card Imagen Principal */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-sm font-semibold text-blue-800 flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Imagen Principal
                        </h5>
                      </div>
                      
                      <div
                        className="relative border-2 border-dashed border-blue-300 rounded-lg bg-white hover:bg-blue-50 transition-colors cursor-pointer"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const file = e.dataTransfer.files[0];
                          if (file && ['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setImagenPreview(reader.result);
                              setImagenFile(file);
                            };
                            reader.readAsDataURL(file);
                          } else {
                            alert('Solo se permiten archivos PNG o JPG');
                          }
                        }}
                      >
                        {imagenPreview ? (
                          <div className="relative">
                            <img src={imagenPreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                            <button
                              type="button"
                              onClick={() => removeImage('imagen')}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 shadow-lg"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center h-48 cursor-pointer">
                            <svg className="w-12 h-12 text-blue-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <span className="text-sm text-gray-600 mb-1">Arrastra o haz clic</span>
                            <span className="text-xs text-gray-500">PNG o JPG (máx. 2MB)</span>
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/jpg"
                              onChange={(e) => handleImageChange(e, 'imagen')}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Card Imagen para Tarjeta */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-sm font-semibold text-green-800 flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                          Imagen para Tarjeta
                        </h5>
                      </div>
                      
                      <div
                        className="relative border-2 border-dashed border-green-300 rounded-lg bg-white hover:bg-green-50 transition-colors cursor-pointer"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const file = e.dataTransfer.files[0];
                          if (file && ['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setImagenCardPreview(reader.result);
                              setImagenCardFile(file);
                            };
                            reader.readAsDataURL(file);
                          } else {
                            alert('Solo se permiten archivos PNG o JPG');
                          }
                        }}
                      >
                        {imagenCardPreview ? (
                          <div className="relative">
                            <img src={imagenCardPreview} alt="Preview Card" className="w-full h-48 object-cover rounded-lg" />
                            <button
                              type="button"
                              onClick={() => removeImage('imagen_card')}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 shadow-lg"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center h-48 cursor-pointer">
                            <svg className="w-12 h-12 text-green-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <span className="text-sm text-gray-600 mb-1">Arrastra o haz clic</span>
                            <span className="text-xs text-gray-500">PNG o JPG (máx. 2MB)</span>
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/jpg"
                              onChange={(e) => handleImageChange(e, 'imagen_card')}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Card Imagen para Slider */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-sm font-semibold text-purple-800 flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                          </svg>
                          Imagen para Slider
                        </h5>
                      </div>
                      
                      <div
                        className="relative border-2 border-dashed border-purple-300 rounded-lg bg-white hover:bg-purple-50 transition-colors cursor-pointer"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const file = e.dataTransfer.files[0];
                          if (file && ['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setImagenSliderPreview(reader.result);
                              setImagenSliderFile(file);
                            };
                            reader.readAsDataURL(file);
                          } else {
                            alert('Solo se permiten archivos PNG o JPG');
                          }
                        }}
                      >
                        {imagenSliderPreview ? (
                          <div className="relative">
                            <img src={imagenSliderPreview} alt="Preview Slider" className="w-full h-48 object-cover rounded-lg" />
                            <button
                              type="button"
                              onClick={() => removeImage('imagen_slider')}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 shadow-lg"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center h-48 cursor-pointer">
                            <svg className="w-12 h-12 text-purple-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <span className="text-sm text-gray-600 mb-1">Arrastra o haz clic</span>
                            <span className="text-xs text-gray-500">PNG o JPG (máx. 2MB)</span>
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/jpg"
                              onChange={(e) => handleImageChange(e, 'imagen_slider')}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>

                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingSorteo ? 'Actualizar' : 'Crear'} Sorteo
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
