import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Bell } from 'lucide-react';

const MainLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-transparent text-text-primary">
      {/* Sidebar - Integrated via component, assuming it handles its own width/style or injected here */}
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 flex items-center justify-between px-6 sticky top-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/10">
          <div className="flex-1" /> {/* Spacer */}

          <div className="flex items-center gap-4">
            <button className="p-2.5 rounded-full text-text-secondary hover:text-brand hover:bg-brand/10 hover:shadow-neon transition-all duration-200 border border-transparent hover:border-brand/20">
              <Bell size={20} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto relative scroll-smooth p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
