import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function ConfiguracionWhatsApp() {
  const [loading, setLoading] = useState(false);
  const [estado, setEstado] = useState(null);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  useEffect(() => {
    // Solo verificar estado una vez al cargar
    verificarEstado();
  }, []);

  const verificarEstado = async () => {
    try {
      const response = await api.get('/admin/whatsapp/status');
      setEstado(response.data);
    } catch (error) {
      console.error('Error verificando estado:', error);
    }
  };

  const obtenerQR = async () => {
    setLoading(true);
    setMensaje({ tipo: '', texto: '' });
    
    try {
      const response = await api.get('/admin/whatsapp/qr');
      
      if (response.data.success) {
        setMensaje({ 
          tipo: 'info', 
          texto: response.data.message || 'Revisa los logs de Docker para ver el código QR' 
        });
      } else {
        setMensaje({ 
          tipo: 'error', 
          texto: response.data.message || 'No se pudo obtener el código QR' 
        });
      }
    } catch (error) {
      setMensaje({ 
        tipo: 'error', 
        texto: 'Error al conectar con el servidor de WhatsApp' 
      });
    } finally {
      setLoading(false);
    }
  };

  const enviarMensajePrueba = async () => {
    setLoading(true);
    setMensaje({ tipo: '', texto: '' });
    
    try {
      const response = await api.post('/admin/whatsapp/test');
      
      if (response.data.success) {
        setMensaje({ 
          tipo: 'success', 
          texto: '¡Mensaje de prueba enviado exitosamente! Revisa tu WhatsApp.' 
        });
      } else {
        setMensaje({ 
          tipo: 'error', 
          texto: response.data.message || 'Error al enviar mensaje de prueba' 
        });
      }
    } catch (error) {
      setMensaje({ 
        tipo: 'error', 
        texto: 'Error al enviar mensaje de prueba' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Configuración de WhatsApp</h1>
        <p className="text-gray-600 mt-2">
          Conecta tu cuenta de WhatsApp para enviar notificaciones automáticas
        </p>
      </div>

      {/* Estado de Conexión */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Estado de Conexión</h2>
        
        <div className="flex items-center gap-4">
          <div className={`w-4 h-4 rounded-full ${
            estado?.data?.connected ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <div>
            <p className="font-medium">
              {estado?.data?.connected ? '✅ Conectado' : '❌ Desconectado'}
            </p>
            {estado?.data?.phone && (
              <p className="text-sm text-gray-600">
                Número: {estado.data.phone}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={verificarEstado}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          disabled={loading}
        >
          🔄 Actualizar Estado
        </button>
      </div>

      {/* Mensajes de alerta */}
      {mensaje.texto && (
        <div className={`rounded-lg p-4 mb-6 ${
          mensaje.tipo === 'success' ? 'bg-green-100 text-green-800' :
          mensaje.tipo === 'error' ? 'bg-red-100 text-red-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {mensaje.texto}
        </div>
      )}

      {/* Conectar con QR */}
      {!estado?.data?.connected && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Conectar WhatsApp</h2>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-4">
            <h3 className="font-semibold text-blue-900 mb-3 text-lg">📱 Cómo conectar WhatsApp:</h3>
            <ol className="list-decimal list-inside space-y-2 text-blue-800">
              <li>Abre una terminal/PowerShell en tu computadora</li>
              <li>Ejecuta el comando: <code className="bg-blue-100 px-2 py-1 rounded">docker-compose logs -f whatsapp</code></li>
              <li>Espera a que aparezca un <strong>código QR</strong> en la consola</li>
              <li>Abre WhatsApp en tu teléfono</li>
              <li>Ve a <strong>Menú (⋮)</strong> → <strong>Dispositivos vinculados</strong></li>
              <li>Toca <strong>"Vincular un dispositivo"</strong></li>
              <li>Escanea el código QR que aparece en la terminal</li>
              <li>¡Listo! Actualiza esta página para ver el estado conectado</li>
            </ol>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-yellow-800 text-sm">
              <strong>💡 Tip:</strong> El código QR se muestra automáticamente en los logs de Docker cuando el servicio de WhatsApp se inicia y no hay una sesión guardada.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={verificarEstado}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold"
              disabled={loading}
            >
              {loading ? '⏳ Verificando...' : '🔄 Verificar Estado'}
            </button>
          </div>
        </div>
      )}

      {/* Enviar mensaje de prueba */}
      {estado?.data?.connected && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Probar Conexión</h2>
          <p className="text-gray-600 mb-4">
            Envía un mensaje de prueba a tu número de administrador para verificar que todo funciona correctamente.
          </p>
          <button
            onClick={enviarMensajePrueba}
            className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition font-semibold"
            disabled={loading}
          >
            {loading ? '⏳ Enviando...' : '🧪 Enviar Mensaje de Prueba'}
          </button>
        </div>
      )}
    </div>
  );
}
