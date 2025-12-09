/**
 * Barra de navegación principal (público y dashboard).
 * Prácticas: UX/UI (feedback claro, accesibilidad), DaisyUI para estilo.
 */

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Logo from './Logo';
import { 
  FiHome, 
  FiUsers, 
  FiCode, 
  FiLogOut, 
  FiSettings, 
  FiSun, 
  FiMoon 
} from 'react-icons/fi';
import { useState } from 'react';

const NavBar = () => {
  const { user, role, isAuthenticated, logout } = useAuth();
  const { theme, changeTheme } = useTheme();
  const navigate = useNavigate();
  const [secretClicks, setSecretClicks] = useState(0);

  const handleLogoClick = () => {
    if (!isAuthenticated) {
      const newCount = secretClicks + 1;
      setSecretClicks(newCount);
      if (newCount === 5) {
        navigate('/login');
        setSecretClicks(0);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div className="navbar bg-base-100 shadow-md sticky top-0 z-50">
      <div className="navbar-start">
        <div className="dropdown">
          <label tabIndex={0} className="btn btn-ghost lg:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </label>
          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
            <li>
              <Link to="/" className="flex items-center gap-2">
                <FiHome /> Inicio
              </Link>
            </li>
            <li>
              <Link to="/programadores" className="flex items-center gap-2">
                <FiUsers /> Equipo
              </Link>
            </li>
            <li>
              <Link to="/proyectos" className="flex items-center gap-2">
                <FiCode /> Proyectos
              </Link>
            </li>
            <li className="menu-title">
              <span>Asesorías</span>
            </li>
            <li>
              <Link to="/agendar-asesoria">
                Agendar
              </Link>
            </li>
            <li>
              <Link to="/mis-solicitudes">
                Mis Solicitudes
              </Link>
            </li>
          </ul>
        </div>
        <div onClick={handleLogoClick} className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
          <Logo size={40} />
          <span className="text-xl sm:text-2xl font-bold tracking-tight">LEXISWARE</span>
        </div>
      </div>

      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li>
            <Link to="/" className="flex items-center gap-2">
              <FiHome /> Inicio
            </Link>
          </li>
          <li>
            <Link to="/programadores" className="flex items-center gap-2">
              <FiUsers /> Equipo
            </Link>
          </li>
          <li>
            <Link to="/proyectos" className="flex items-center gap-2">
              <FiCode /> Proyectos
            </Link>
          </li>
          <li>
            <details>
              <summary>Asesorías</summary>
              <ul className="p-2 bg-base-100 rounded-box w-48">
                <li><Link to="/agendar-asesoria">Agendar</Link></li>
                <li><Link to="/mis-solicitudes">Mis Solicitudes</Link></li>
              </ul>
            </details>
          </li>
        </ul>
      </div>

      <div className="navbar-end gap-2">
        {/* Theme selector */}
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost btn-circle">
            {theme === 'dracula' ? <FiMoon size={20} /> : <FiSun size={20} />}
          </label>
          <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
            <li><button onClick={() => changeTheme('forest')}>Forest</button></li>
            <li><button onClick={() => changeTheme('synthwave')}>Synthwave</button></li>
            <li><button onClick={() => changeTheme('dracula')}>Dracula</button></li>
          </ul>
        </div>

        {isAuthenticated && user ? (
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full">
                <img src={user.photoURL || '/default-avatar.png'} alt="Usuario" />
              </div>
            </label>
            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
              <li className="menu-title">
                <span>{user.email}</span>
              </li>
              {role === 'admin' && (
                <li>
                  <Link to="/admin" className="flex items-center gap-2">
                    <FiSettings /> Panel Admin
                  </Link>
                </li>
              )}
              {role === 'programmer' && (
                <li>
                  <Link to="/panel" className="flex items-center gap-2">
                    <FiCode /> Mi Dashboard
                  </Link>
                </li>
              )}
              <li>
                <button onClick={handleLogout} className="flex items-center gap-2 text-error">
                  <FiLogOut /> Cerrar sesión
                </button>
              </li>
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default NavBar;