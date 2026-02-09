/**
 * Dashboard del Administrador - Estilo Alienware Command Center
 * Diseño con hexágonos, líneas angulares y efectos neón adaptativos
 */
import { useEffect, useState, useRef } from 'react'
import { getProgrammers } from '../../services/programmers'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, AreaChart, Area } from 'recharts'
import api from '../../services/api'
import { FaCalendarAlt } from 'react-icons/fa'
import { FiUsers, FiActivity, FiLayers, FiDownload, FiTrendingUp, FiCpu, FiDatabase, FiZap } from 'react-icons/fi'
import { BiNetworkChart } from 'react-icons/bi'
import { motion, animate } from 'framer-motion'
import { useTheme } from '../../context/ThemeContext'

// Mapeo de colores por tema
const THEME_COLORS = {
  forest: {
    primary: '#10b981',     // green-500
    secondary: '#059669',   // green-600
    accent: '#34d399',      // green-400
    glow: 'rgba(16, 185, 129, 0.3)'
  },
  synthwave: {
    primary: '#06b6d4',     // cyan-500
    secondary: '#a855f7',    // purple-500
    accent: '#f472b6',       // pink-400
    glow: 'rgba(6, 182, 212, 0.3)'
  },
  dracula: {
    primary: '#a855f7',     // purple-500
    secondary: '#ec4899',    // pink-500
    accent: '#f97316',       // orange-500
    glow: 'rgba(168, 85, 247, 0.3)'
  }
}

// Contador animado
const AnimatedCounter = ({ value, duration = 1.5 }: { value: number, duration?: number }) => {
  const nodeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    const controls = animate(0, value, {
      duration,
      onUpdate: (latest) => {
        node.textContent = Math.round(latest).toLocaleString('es-ES');
      },
      ease: "easeOut"
    });

    return () => controls.stop();
  }, [value, duration]);

  return <span ref={nodeRef} />;
};

const getMonthName = (month: number) => {
  const date = new Date();
  date.setMonth(month - 1);
  return date.toLocaleString('es-ES', { month: 'short' }).toUpperCase();
}

const getLast6Months = () => {
  const months = [];
  const today = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    months.push({
      month: d.getMonth() + 1,
      year: d.getFullYear(),
      name: getMonthName(d.getMonth() + 1),
      usuarios: 0
    });
  }
  return months;
}

const AdminDashboard = () => {
  const { theme } = useTheme()
  const colors = THEME_COLORS[theme]

  const [programmersCount, setProgrammersCount] = useState<number>(0)
  const [pendingAdvisories, setPendingAdvisories] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState<any[]>([])
  const [pieData, setPieData] = useState<any[]>([])
  const [projectData, setProjectData] = useState<any[]>([])
  const [activeProjectsCount, setActiveProjectsCount] = useState<number>(0)
  const [advisoryStats, setAdvisoryStats] = useState({ approved: 0, rejected: 0, pending: 0 });
  const [currentTime, setCurrentTime] = useState(new Date())

  // Actualizar reloj cada segundo
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const loadStats = async () => {
      try {
        const programmers = await getProgrammers()
        setProgrammersCount(programmers.length)

        try {
          const stats = await api.get('/api/dashboard/stats');
          setPendingAdvisories(stats.data.advisoriesPending);
          setActiveProjectsCount(stats.data.projectsCount);
          setAdvisoryStats({
            approved: stats.data.advisoriesApproved,
            rejected: stats.data.advisoriesRejected,
            pending: stats.data.advisoriesPending
          });

          setPieData([
            { name: 'Pendientes', value: stats.data.advisoriesPending },
            { name: 'Aprobadas', value: stats.data.advisoriesApproved },
            { name: 'Rechazadas', value: stats.data.advisoriesRejected },
          ])
        } catch (e) {
          console.error("Error stats", e);
        }

        try {
          const growthResponse = await api.get('/api/dashboard/user-growth');
          let template = getLast6Months();

          growthResponse.data.forEach((item: any) => {
            const match = template.find(t => t.month === item.month && t.year === item.year);
            if (match) {
              match.usuarios = item.count;
            }
          });
          setChartData(template);
        } catch (e) {
          setChartData(getLast6Months());
        }

        try {
          const projectsResponse = await api.get('/api/dashboard/projects-by-user');
          const projectsFormatted = projectsResponse.data.map((item: any) => ({
            name: item.userName || 'Usuario',
            proyectos: item.projectCount
          }));
          setProjectData(projectsFormatted);
        } catch (e) {
          setProjectData([])
        }

      } catch (error) {
        console.error('Error general:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  const downloadPdf = async (type: 'programmers' | 'advisories') => {
    try {
      const response = await api.get(`/api/reports/${type}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type === 'programmers' ? 'programadores' : 'asesorias'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert("Error al descargar el reporte.");
    }
  }

  return (
    <div
      className="min-h-screen p-4 relative overflow-hidden transition-colors duration-500"
      style={{
        background: theme === 'dracula' ? '#1a1a2e' : theme === 'synthwave' ? '#0f0f1e' : '#0a1f0d'
      }}
    >
      {/* Efectos de fondo tipo Alienware */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        {/* Grid hexagonal */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, ${colors.primary}22 1px, transparent 1px)`,
            backgroundSize: '30px 30px'
          }}
        />

        {/* Líneas diagonales */}
        <svg className="absolute inset-0 w-full h-full">
          <defs>
            <pattern id="diagonalLines" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="20" y2="20" stroke={colors.primary} strokeWidth="0.5" opacity="0.1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#diagonalLines)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-[1800px] mx-auto">

        {/* Header Alienware Style */}
        <div
          className="mb-6 p-6 relative overflow-hidden rounded-none"
          style={{
            background: `linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 100%)`,
            clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)',
            boxShadow: `0 0 30px ${colors.glow}, inset 0 0 20px rgba(0,0,0,0.5)`
          }}
        >
          {/* Borde neón superior */}
          <div
            className="absolute top-0 left-0 right-0 h-1"
            style={{
              background: `linear-gradient(90deg, transparent, ${colors.primary}, ${colors.secondary}, ${colors.primary}, transparent)`,
              boxShadow: `0 0 10px ${colors.primary}`
            }}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Logo y Sistema */}
            <div className="flex items-center gap-4">
              <div
                className="relative w-16 h-16 flex items-center justify-center"
                style={{
                  clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                  background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                  boxShadow: `0 0 20px ${colors.glow}`
                }}
              >
                <BiNetworkChart className="text-3xl text-white" />
              </div>
              <div>
                <h1
                  className="text-3xl font-black uppercase tracking-wider"
                  style={{
                    color: colors.primary,
                    textShadow: `0 0 20px ${colors.glow}`
                  }}
                >
                  LEXISWARE
                </h1>
                <p className="text-xs text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: colors.accent, boxShadow: `0 0 10px ${colors.accent}` }}
                  />
                  COMMAND CENTER
                </p>
              </div>
            </div>

            {/* Reloj Central */}
            <div className="flex flex-col items-center justify-center">
              <div
                className="text-4xl font-mono font-bold tabular-nums"
                style={{
                  color: colors.primary,
                  textShadow: `0 0 10px ${colors.glow}`
                }}
              >
                {currentTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">
                {currentTime.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>

            {/* Status System */}
            <div className="flex flex-col gap-2">
              <div
                className="flex items-center justify-between px-4 py-2 bg-black/40 border-l-2"
                style={{ borderColor: colors.accent }}
              >
                <span className="text-xs text-gray-400 flex items-center gap-2">
                  <FiCpu style={{ color: colors.accent }} />
                  SYSTEM STATUS
                </span>
                <span
                  className="text-xs font-bold"
                  style={{ color: colors.accent }}
                >
                  ONLINE
                </span>
              </div>
              <div
                className="flex items-center justify-between px-4 py-2 bg-black/40 border-l-2"
                style={{ borderColor: colors.primary }}
              >
                <span className="text-xs text-gray-400 flex items-center gap-2">
                  <FiZap style={{ color: colors.primary }} />
                  PERFORMANCE
                </span>
                <span
                  className="text-xs font-bold"
                  style={{ color: colors.primary }}
                >
                  96%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Columna Izquierda - Gráficos */}
          <div className="lg:col-span-8 space-y-6">

            {/* Gráfico de Usuarios */}
            <div
              className="p-6 bg-black/60 backdrop-blur-sm border"
              style={{
                borderColor: colors.primary + '40',
                clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))',
                boxShadow: `inset 0 0 20px ${colors.glow}`
              }}
            >
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-800">
                <FiActivity style={{ color: colors.primary, fontSize: '1.5rem' }} />
                <h3
                  className="text-lg font-bold uppercase tracking-wide"
                  style={{ color: colors.primary }}
                >
                  CRECIMIENTO DE USUARIOS
                </h3>
              </div>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id={`colorUsuarios-${theme}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={colors.primary} stopOpacity={0.8} />
                        <stop offset="95%" stopColor={colors.primary} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="name" stroke="#666" tick={{ fill: '#999', fontSize: 11 }} />
                    <YAxis stroke="#666" tick={{ fill: '#999', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        border: `1px solid ${colors.primary}`,
                        borderRadius: '0px',
                        color: '#fff'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="usuarios"
                      stroke={colors.primary}
                      strokeWidth={3}
                      fill={`url(#colorUsuarios-${theme})`}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráficos inferior */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Radar Chart */}
              <div
                className="p-5 bg-black/60 backdrop-blur-sm border"
                style={{
                  borderColor: colors.secondary + '40',
                  clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)',
                  boxShadow: `inset 0 0 20px ${colors.glow}`
                }}
              >
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-800">
                  <FiLayers style={{ color: colors.secondary }} />
                  <h3
                    className="text-sm font-bold uppercase tracking-wide"
                    style={{ color: colors.secondary }}
                  >
                    DISTRIBUCIÓN
                  </h3>
                </div>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={[
                      { subject: 'Programadores', value: programmersCount, fullMark: 20 },
                      { subject: 'Proyectos', value: activeProjectsCount, fullMark: 20 },
                      { subject: 'Aprobadas', value: advisoryStats.approved, fullMark: 20 },
                      { subject: 'Pendientes', value: pendingAdvisories, fullMark: 20 },
                      { subject: 'Rechazadas', value: advisoryStats.rejected, fullMark: 20 }
                    ]}>
                      <PolarGrid stroke="#333" />
                      <PolarAngleAxis dataKey="subject" stroke="#666" tick={{ fill: '#999', fontSize: 10 }} />
                      <PolarRadiusAxis stroke="#666" />
                      <Radar
                        name="Métricas"
                        dataKey="value"
                        stroke={colors.primary}
                        fill={colors.primary}
                        fillOpacity={0.6}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Proyectos Bar */}
              <div
                className="p-5 bg-black/60 backdrop-blur-sm border"
                style={{
                  borderColor: colors.accent + '40',
                  clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)',
                  boxShadow: `inset 0 0 20px ${colors.glow}`
                }}
              >
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-800">
                  <BiNetworkChart style={{ color: colors.accent }} />
                  <h3
                    className="text-sm font-bold uppercase tracking-wide"
                    style={{ color: colors.accent }}
                  >
                    PROYECTOS
                  </h3>
                </div>

                <div className="space-y-3">
                  {projectData.slice(0, 5).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="text-xs text-gray-500 w-24 truncate">{item.name}</div>
                      <div className="flex-1 h-6 bg-gray-900 relative overflow-hidden">
                        <div
                          className="h-full transition-all duration-1000"
                          style={{
                            width: `${(item.proyectos / Math.max(...projectData.map(p => p.proyectos))) * 100}%`,
                            background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`,
                            boxShadow: `0 0 10px ${colors.glow}`
                          }}
                        />
                      </div>
                      <div
                        className="text-sm font-bold w-8 text-right"
                        style={{ color: colors.primary }}
                      >
                        {item.proyectos}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha - KPIs */}
          <div className="lg:col-span-4 space-y-6">

            {/* KPI Cards Hexagonales */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: FiUsers, label: 'DEVS', value: programmersCount, color: colors.primary },
                { icon: FiDatabase, label: 'PROYECTOS', value: activeProjectsCount, color: colors.secondary },
                { icon: FaCalendarAlt, label: 'APROBADAS', value: advisoryStats.approved, color: colors.accent },
                { icon: FiActivity, label: 'PENDIENTES', value: pendingAdvisories, color: colors.primary }
              ].map((kpi, idx) => (
                <div
                  key={idx}
                  className="relative p-4 bg-black/70 backdrop-blur-sm border group hover:scale-105 transition-transform cursor-pointer"
                  style={{
                    borderColor: kpi.color + '60',
                    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                    boxShadow: `inset 0 0 15px ${kpi.color}40`
                  }}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <kpi.icon className="text-3xl mb-2" style={{ color: kpi.color }} />
                    <div
                      className="text-4xl font-black mb-1"
                      style={{
                        color: kpi.color,
                        textShadow: `0 0 10px ${kpi.color}`
                      }}
                    >
                      <AnimatedCounter value={kpi.value} />
                    </div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                      {kpi.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Indicador de Eficiencia */}
            <div
              className="p-6 bg-black/70 backdrop-blur-sm border"
              style={{
                borderColor: colors.primary + '40',
                clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)',
                boxShadow: `inset 0 0 20px ${colors.glow}`
              }}
            >
              <div className="text-center">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-4">SYSTEM EFFICIENCY</div>
                <div className="relative inline-block">
                  <svg className="w-40 h-40 rotate-[-90deg]">
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      fill="none"
                      stroke="#222"
                      strokeWidth="8"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      fill="none"
                      stroke={colors.primary}
                      strokeWidth="8"
                      strokeDasharray="439.6"
                      strokeDashoffset="43.96"
                      strokeLinecap="round"
                      style={{
                        filter: `drop-shadow(0 0 10px ${colors.primary})`
                      }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                      className="text-5xl font-black"
                      style={{
                        color: colors.primary,
                        textShadow: `0 0 20px ${colors.glow}`
                      }}
                    >
                      96%
                    </span>
                    <span className="text-xs text-gray-500 uppercase">OPTIMAL</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Botones de Descarga */}
            <div
              className="p-5 bg-black/70 backdrop-blur-sm border"
              style={{
                borderColor: colors.secondary + '40',
                clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)',
                boxShadow: `inset 0 0 20px ${colors.glow}`
              }}
            >
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-800">
                <FiDownload style={{ color: colors.secondary }} />
                <h3
                  className="text-sm font-bold uppercase tracking-wide"
                  style={{ color: colors.secondary }}
                >
                  REPORTES PDF
                </h3>
              </div>

              <div className="space-y-3">
                {[
                  { type: 'programmers', label: 'PROGRAMADORES', icon: FiUsers },
                  { type: 'advisories', label: 'ASESORÍAS', icon: FaCalendarAlt }
                ].map((report, idx) => (
                  <button
                    key={idx}
                    onClick={() => downloadPdf(report.type as any)}
                    className="w-full flex items-center justify-between p-3 bg-black/50 border group hover:bg-black/70 transition-all"
                    style={{
                      borderColor: colors.primary + '40',
                      clipPath: 'polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <report.icon style={{ color: colors.primary }} />
                      <span
                        className="text-xs font-bold uppercase"
                        style={{ color: colors.primary }}
                      >
                        {report.label}
                      </span>
                    </div>
                    <FiDownload
                      className="group-hover:translate-y-1 transition-transform"
                      style={{ color: colors.accent }}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard