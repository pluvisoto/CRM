import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Trello, Users, Settings, BarChart3, MessageSquare, LogOut, ChevronRight, ChevronDown, Plus, Shield } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const Sidebar = () => {
  console.log("Sidebar Rendering...");
  const { signOut, user, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [pipelines, setPipelines] = useState([]);
  const [isPipelineMenuOpen, setIsPipelineMenuOpen] = useState(false);

  useEffect(() => {
    fetchPipelines();
    if (location.pathname.includes('/pipeline')) {
      setIsPipelineMenuOpen(true);
    }
  }, [location.pathname]);

  const fetchPipelines = async () => {
    try {
      const { data, error } = await supabase.from('pipelines').select('*').order('created_at', { ascending: true });
      if (!error && data) {
        setPipelines(data);
      }
    } catch (err) {
      console.error('Error fetching pipelines in sidebar:', err);
    }
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Erro ao sair: " + error.message);
    }
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Contatos', path: '/contacts' },
    { icon: MessageSquare, label: 'Mensagens', path: '/messages' },
    { icon: BarChart3, label: 'Financeiro', path: '/finance' },

    { icon: BarChart3, label: 'Relatórios', path: '/reports' },
    ...(role === 'admin' ? [{ icon: Shield, label: 'Equipe', path: '/team' }] : []),
    { icon: Settings, label: 'Configurações', path: '/settings' },
  ];

  return (
    <aside className="w-64 flex flex-col h-screen border-r border-white/20 bg-white/20 backdrop-blur-xl shadow-2xl relative z-40">
      <div className="h-16 flex items-center px-6 border-b border-white/10 bg-white/10">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">
          recupera<span className="text-brand">.ia</span>
        </h1>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${isActive
              ? 'bg-brand text-white shadow-lg shadow-brand/30 translate-x-1'
              : 'text-text-secondary hover:bg-white/30 hover:text-text-primary hover:translate-x-1'
            }`
          }
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        {/* PIPELINE GROUP */}
        <div className="flex flex-col gap-1">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium cursor-pointer transition-all duration-300 ${location.pathname.includes('/pipeline')
              ? 'bg-brand/10 text-brand'
              : 'text-text-secondary hover:bg-white/30 hover:text-text-primary'
              }`}
            onClick={() => setIsPipelineMenuOpen(!isPipelineMenuOpen)}
          >
            <Trello size={20} />
            <span className="flex-1">Pipelines</span>
            {isPipelineMenuOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </div>

          {isPipelineMenuOpen && (
            <div className="ml-4 pl-3 border-l-2 border-brand/30 flex flex-col gap-1 my-1">
              {pipelines.map(p => (
                <NavLink
                  key={p.id}
                  to={`/pipeline/${p.id}`}
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-lg text-xs font-medium transition-all truncate ${isActive
                      ? 'bg-brand/20 text-brand-dark font-semibold'
                      : 'text-text-muted hover:bg-white/20 hover:text-text-primary'
                    }`
                  }
                >
                  {p.name}
                </NavLink>
              ))}
              <div
                className="flex items-center gap-2 px-3 py-2 text-xs text-text-muted italic hover:text-brand cursor-pointer hover:font-semibold transition-colors"
                onClick={() => navigate('/pipeline/new')}
              >
                <Plus size={12} /> Novo Pipeline
              </div>
            </div>
          )}
        </div>

        {navItems.filter(i => i.path !== '/dashboard' && i.path !== '/pipeline').map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${isActive
                ? 'bg-brand text-white shadow-lg shadow-brand/30 translate-x-1'
                : 'text-text-secondary hover:bg-white/30 hover:text-text-primary hover:translate-x-1'
              }`
            }
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10 bg-white/10 backdrop-blur-md flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-brand/20 text-brand flex items-center justify-center font-bold border-2 border-brand/30 shadow-neon">
          {user?.email?.[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-text-primary truncate">
            {user?.email || 'Usuário'}
          </div>
          <div className="text-xs text-text-secondary capitalize">
            {role || 'Carregando...'}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 rounded-lg text-text-secondary hover:text-red-500 hover:bg-red-500/10 transition-colors"
          title="Sair"
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
