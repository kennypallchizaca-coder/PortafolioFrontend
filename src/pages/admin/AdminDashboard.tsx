/**
 * Dashboard del Administrador (Estilo Analítica de Datos Premium).
 * Diseño inspirado en tableros de control financiero/corporativo.
 */
import { useEffect, useState, useRef } from 'react'
import { getProgrammers } from '../../services/programmers'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'
import api from '../../services/api'
import { FaCalendarAlt } from 'react-icons/fa'
import { FiUsers, FiActivity, FiLayers, FiDownload, FiTrendingUp } from 'react-icons/fi'
import { BiNetworkChart, BiStats } from 'react-icons/bi'
import { motion, animate } from 'framer-motion'

// --- Componentes Auxiliares para Animaciones ---

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

// Generar últimos 6 meses vacíos para rellenar gráfica
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

const COLORS = ['#00C49F', '#FFBB28', '#FF8042', '#0088FE'];

// Variantes de Framer Motion
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 100 }
  }
};

const cardHoverVariants = {
  hover: {
    scale: 1.02,
    boxShadow: "0px 10px 30px rgba(6, 182, 212, 0.2)",
    borderColor: "rgba(6, 182, 212, 0.5)",
    transition: { duration: 0.3 }
  }
};

const AdminDashboard = () => {
  const [programmersCount, setProgrammersCount] = useState<number>(0)
  const [pendingAdvisories, setPendingAdvisories] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  const [chartData, setChartData] = useState<any[]>([])
  const [pieData, setPieData] = useState<any[]>([])
  const [projectData, setProjectData] = useState<any[]>([])
  const [activeProjectsCount, setActiveProjectsCount] = useState<number>(0)
  const [advisoryStats, setAdvisoryStats] = useState({ approved: 0, rejected: 0, pending: 0 });


  // Fecha actual formateada
  const todayDate = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

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

          // Gráfico de pastel (Donut Chart)
          setPieData([
            { name: 'Pendientes', value: stats.data.advisoriesPending },
            { name: 'Aprobadas', value: stats.data.advisoriesApproved },
            { name: 'Rechazadas', value: stats.data.advisoriesRejected },
          ])
        } catch (e) {
          console.error("Error stats", e);
        }

        // Crecimiento de usuarios 
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

        // Proyectos
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
    <div className="bg-[#0f1014] min-h-screen text-gray-100 p-4 font-sans selection:bg-cyan-500 selection:text-white overflow-hidden">

      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-900/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative z-10 max-w-[1600px] mx-auto"
      >

        {/* Top Bar - Header Style "Analítica" */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-center mb-6 bg-[#18181b]/80 backdrop-blur-md border-b border-cyan-500/30 p-4 rounded-xl shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
              <BiNetworkChart className="text-4xl text-cyan-400 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-widest text-cyan-400 uppercase drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                Analítica de Datos
              </h1>
              <p className="text-xs text-cyan-400/60 uppercase tracking-wider">Centro de Comando</p>
            </div>
          </div>

        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* COLUMNA IZQUIERDA (8) */}
          <div className="md:col-span-8 flex flex-col gap-6">

            {/* Gráfico 1: Usuarios x Mes (Líneas) */}
            <motion.div
              variants={itemVariants}
              whileHover="hover"
              className="bg-[#18181b] border border-gray-800 p-5 rounded-xl shadow-xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-cyan-500/10"></div>

              <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
                <h3 className="text-cyan-400 font-bold uppercase tracking-wide flex items-center gap-2">
                  <FiActivity className="text-xl" /> Crecimiento de Usuarios
                </h3>
                <span className="text-xs px-2 py-1 bg-cyan-900/20 text-cyan-300 rounded border border-cyan-900/30">Último Semestre</span>
              </div>
              <div className="h-80 w-full p-2 relative">
                {/* Grid decorativo de fondo */}
                <div className="absolute inset-0 z-0 opacity-5 pointer-events-none"
                  style={{ backgroundImage: 'linear-gradient(#4b5563 1px, transparent 1px), linear-gradient(90deg, #4b5563 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorUsuarios" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                    <XAxis dataKey="name" stroke="#52525b" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} dy={10} />
                    <YAxis stroke="#52525b" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      cursor={{ stroke: '#06b6d4', strokeWidth: 1, strokeDasharray: '3 3' }}
                      itemStyle={{ color: '#06b6d4' }}
                      contentStyle={{ backgroundColor: 'rgba(24, 24, 27, 0.95)', border: '1px solid #06b6d4', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="usuarios"
                      stroke="#06b6d4"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#18181b', stroke: '#06b6d4', strokeWidth: 2 }}
                      activeDot={{ r: 8, fill: '#06b6d4', stroke: '#fff', strokeWidth: 2 }}
                      fill="url(#colorUsuarios)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Fila Inferior: Pastel y Barras Horizontales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Gráfico 2: Asesorías (Pie Chart) */}
              <motion.div
                variants={itemVariants}
                whileHover="hover"
                className="bg-[#18181b] border border-gray-800 p-5 rounded-xl shadow-xl flex flex-col"
              >
                <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-2">
                  <h3 className="text-green-400 font-bold uppercase tracking-wide flex items-center gap-2">
                    <FiLayers /> Estado de Asesorías
                  </h3>
                  <span className="text-xs text-gray-500 font-mono">
                    Total: <strong className="text-white"><AnimatedCounter value={pieData.reduce((a, b) => a + (b.value || 0), 0)} /></strong>
                  </span>
                </div>
                <div className="flex-1 min-h-[250px] relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                          const RADIAN = Math.PI / 180;
                          const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                          const x = cx + radius * Math.cos(-midAngle * RADIAN);
                          const y = cy + radius * Math.sin(-midAngle * RADIAN);
                          return percent > 0.05 ? (
                            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12} fontWeight="bold">
                              {`${(percent * 100).toFixed(0)}%`}
                            </text>
                          ) : null;
                        }}
                        outerRadius={90}
                        dataKey="value"
                        stroke="none"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#fbbf24', '#10b981', '#ef4444'][index % 3]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#18181b', borderRadius: '8px', border: '1px solid #374151', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Gráfico 3: Proyectos (Horizontal) */}
              <motion.div
                variants={itemVariants}
                whileHover="hover"
                className="bg-[#18181b] border border-gray-800 p-5 rounded-xl shadow-xl flex flex-col"
              >
                <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-2">
                  <h3 className="text-orange-400 font-bold uppercase tracking-wide flex items-center gap-2">
                    <BiNetworkChart /> Top Proyectos
                  </h3>
                </div>
                <div className="flex-1 min-h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={projectData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#27272a" />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" width={80} tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: 'rgba(249, 115, 22, 0.1)' }} contentStyle={{ backgroundColor: '#18181b', border: '1px solid #f97316', color: '#fff', borderRadius: '8px' }} />
                      <Bar dataKey="proyectos" fill="#f97316" radius={[0, 4, 4, 0]} barSize={25} animationDuration={1500}>
                        {projectData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={'#f97316'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

            </div>

          </div>

          {/* COLUMNA DERECHA (4) - KPIs y Botones */}
          <div className="md:col-span-4 flex flex-col gap-6">

            {/* KPI Principal Circle */}
            <motion.div
              variants={itemVariants}
              className="bg-[#18181b] border border-gray-800 p-6 rounded-xl shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-2 opacity-5">
                <BiNetworkChart className="text-9xl text-white" />
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <BiStats className="text-xl text-purple-400" />
                </div>
                <h3 className="text-purple-400 font-bold uppercase tracking-wide">Métricas Clave</h3>
              </div>

              <div className="flex justify-center items-center py-6 relative">
                {/* Círculo animado de fondo */}
                <div className="absolute w-48 h-48 border-2 border-dashed border-gray-700 rounded-full animate-[spin_10s_linear_infinite] opacity-30"></div>

                <div className="relative w-44 h-44 rounded-full border-[6px] border-[#18181b] flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.2)] bg-[#121215] z-10 before:absolute before:inset-0 before:rounded-full before:border-[6px] before:border-purple-500 before:border-l-transparent before:border-r-transparent before:rotate-45">
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400">
                      <AnimatedCounter value={96} />%
                    </span>
                    <span className="text-xs text-green-400 font-bold flex items-center gap-1 mt-1">
                      <FiTrendingUp /> Eficiencia
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-8">
                <motion.div whileHover={{ y: -5 }} className="text-center p-4 bg-[#121215] rounded-xl border border-gray-800 hover:border-cyan-500/50 transition-colors group">
                  <span className="block text-3xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                    <AnimatedCounter value={programmersCount} />
                  </span>
                  <span className="text-[10px] text-gray-500 uppercase flex justify-center items-center gap-1 font-bold tracking-wider mt-1">
                    <FiUsers className="inline" /> Devs
                  </span>
                </motion.div>
                <motion.div whileHover={{ y: -5 }} className="text-center p-4 bg-[#121215] rounded-xl border border-gray-800 hover:border-orange-500/50 transition-colors group">
                  <span className="block text-3xl font-bold text-white group-hover:text-orange-400 transition-colors">
                    <AnimatedCounter value={activeProjectsCount} />
                  </span>
                  <span className="text-[10px] text-gray-500 uppercase flex justify-center items-center gap-1 font-bold tracking-wider mt-1">
                    <FiActivity className="inline" /> Proyectos
                  </span>
                </motion.div>
              </div>
            </motion.div>

            {/* Botones de Acción */}
            <motion.div
              variants={itemVariants}
              className="bg-[#18181b] border border-gray-800 p-5 rounded-xl shadow-xl"
            >
              <h3 className="text-white font-bold uppercase tracking-wide mb-4 border-b border-gray-800 pb-2 text-sm text-gray-400">
                Zona de Descargas
              </h3>
              <div className="flex flex-col gap-3">
                <div onClick={() => downloadPdf('programmers')} className="relative overflow-hidden flex justify-between items-center bg-[#121215] p-4 rounded-lg border-l-[3px] border-red-500 hover:bg-gray-800 transition-all cursor-pointer group shadow-lg hover:shadow-red-900/10">
                  <div className="relative z-10">
                    <span className="block text-white font-bold group-hover:text-red-400 transition-colors text-sm">Reporte Programadores</span>
                    <span className="text-[10px] text-gray-500">Formato PDF • Completo</span>
                  </div>
                  <FiDownload className="text-gray-600 group-hover:text-red-500 text-xl transition-colors transform group-hover:scale-110 relative z-10" />
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 to-red-500/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500"></div>
                </div>

                <div onClick={() => downloadPdf('advisories')} className="relative overflow-hidden flex justify-between items-center bg-[#121215] p-4 rounded-lg border-l-[3px] border-green-500 hover:bg-gray-800 transition-all cursor-pointer group shadow-lg hover:shadow-green-900/10">
                  <div className="relative z-10">
                    <span className="block text-white font-bold group-hover:text-green-400 transition-colors text-sm">Reporte Asesorías</span>
                    <span className="text-[10px] text-gray-500">Formato PDF • Estados</span>
                  </div>
                  <FiDownload className="text-gray-600 group-hover:text-green-500 text-xl transition-colors transform group-hover:scale-110 relative z-10" />
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 to-green-500/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500"></div>
                </div>

              </div>
            </motion.div>

          </div>

        </div>
      </motion.div>
    </div>
  )
}

export default AdminDashboard