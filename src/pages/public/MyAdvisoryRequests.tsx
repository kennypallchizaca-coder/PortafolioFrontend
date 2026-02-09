/**
 * Componente para ver las solicitudes de asesoría del usuario externo.
 * Seguridad: Solo muestra solicitudes del usuario autenticado.
 */
import { useEffect, useState } from 'react'
import { getAdvisoriesByRequester, clearAdvisoryHistory, clearRequesterHistory, type Advisory } from '../../services/advisories'
import { useAuth } from '../../context/AuthContext'
import { motion } from 'framer-motion'
import {
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiCalendar,
  FiUser,
  FiMessageSquare,
  FiRefreshCw,
  FiInbox,
  FiTrash2
} from 'react-icons/fi'

const MyAdvisoryRequests = () => {
  const { user } = useAuth()
  const [requests, setRequests] = useState<Advisory[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Cargar solicitudes automáticamente al montar
  useEffect(() => {
    if (user?.email) {
      fetchRequests()
    } else {
      setLoading(false)
    }
  }, [user])

  const fetchRequests = async () => {
    if (!user?.email) return

    try {
      const data = await getAdvisoriesByRequester(user.email)
      // Ordenar por fecha (más reciente primero)
      const sortedData = data.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`)
        const dateB = new Date(`${b.date}T${b.time}`)
        return dateB.getTime() - dateA.getTime()
      })
      setRequests(sortedData)
    } catch (err) {
      console.error('Error fetching requests:', err)
      // En producción podrías mostrar un toast de error aquí
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchRequests()
  }

  const handleClearHistory = async () => {
    if (!user?.email) return
    if (!confirm('¿Estás seguro de que deseas borrar el historial? Esto eliminará las asesorías aprobadas y rechazadas.')) return

    try {
      setLoading(true)
      await clearRequesterHistory(user.email)
      await fetchRequests()
    } catch (err) {
      console.error('Error clearing history:', err)
      alert('No se pudo borrar el historial')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <div className="badge badge-success gap-2 p-3 text-white">
            <FiCheckCircle /> Aprobada
          </div>
        )
      case 'rejected':
        return (
          <div className="badge badge-error gap-2 p-3 text-white">
            <FiXCircle /> Rechazada
          </div>
        )
      default: // PENDING
        return (
          <div className="badge badge-warning gap-2 p-3 text-white">
            <FiClock /> Pendiente
          </div>
        )
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-base-content/70">Cargando tus solicitudes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Mis Solicitudes</h1>
          <p className="text-base-content/70 mt-1">
            Historial de tus asesorías solicitadas
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleClearHistory}
            className="btn btn-ghost btn-circle text-error"
            title="Borrar historial"
            disabled={loading}
          >
            <FiTrash2 className="w-5 h-5" />
          </button>
          <button
            onClick={handleRefresh}
            className="btn btn-ghost btn-circle"
            disabled={refreshing}
          >
            <FiRefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {requests.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center p-12 text-center bg-base-100 rounded-3xl shadow-sm border border-base-200"
          >
            <div className="w-16 h-16 bg-base-200 rounded-full flex items-center justify-center mb-4">
              <FiInbox className="w-8 h-8 text-base-content/40" />
            </div>
            <h3 className="text-lg font-semibold">No tienes solicitudes</h3>
            <p className="text-base-content/60 max-w-xs mx-auto mt-2">
              Aún no has solicitado ninguna asesoría. ¡Agenda una con nuestros expertos!
            </p>
          </motion.div>
        ) : (
          requests.map((request, index) => (
            <motion.div
              key={request.id || index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow duration-300 border border-base-200"
            >
              <div className="card-body">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <FiUser className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{request.programmerName}</h3>
                      <div className="flex items-center gap-2 text-sm text-base-content/60">
                        <FiCalendar className="w-4 h-4" />
                        <span>{request.date}</span>
                        <span>•</span>
                        <FiClock className="w-4 h-4" />
                        <span>{request.time}</span>
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(request.status)}
                </div>

                <div className="divider my-0"></div>

                <div className="grid md:grid-cols-2 gap-6 mt-2">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-base-content/80">
                      <FiMessageSquare className="w-4 h-4" />
                      Tu mensaje:
                    </div>
                    <p className="text-base-content/70 text-sm bg-base-200/50 p-3 rounded-lg">
                      {request.note || 'Sin mensaje adicional'}
                    </p>
                  </div>

                  {request.responseMessage && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                        <FiMessageSquare className="w-4 h-4" />
                        Respuesta del programador:
                      </div>
                      <p className="text-base-content/70 text-sm bg-primary/5 p-3 rounded-lg border border-primary/10">
                        {request.responseMessage}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}

export default MyAdvisoryRequests
