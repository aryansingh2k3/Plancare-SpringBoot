import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Sprout, LayoutDashboard, PlusCircle, Leaf, Menu, X } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import PlantsCatalog from './pages/PlantsCatalog';
import PlantDetails from './pages/PlantDetails';
import PlantForm from './pages/PlantForm';

function SidebarContent({ onClose }) {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/plants', label: 'My Plants', icon: <Sprout size={20} /> },
    { path: '/plants/new', label: 'Add Plant', icon: <PlusCircle size={20} /> },
  ];

  return (
    <div className="flex flex-col h-full bg-emerald-950 text-white p-6">
      {/* Branding */}
      <div className="flex items-center space-x-3 pb-8 border-b border-emerald-900/50">
        <div className="p-2.5 bg-emerald-500 rounded-xl">
          <Leaf size={24} className="text-white fill-current" />
        </div>
        <div>
          <span className="font-bold text-lg leading-none block tracking-tight">PlantCare AI</span>
          <span className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase mt-1 block">Care Assistant</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-8 space-y-2">
        {navItems.map((item) => {
          // Precise active logic
          const isActive = 
            item.path === '/' 
              ? location.pathname === '/' 
              : location.pathname.startsWith(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl font-bold text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/10'
                  : 'text-emerald-100/70 hover:bg-emerald-900/40 hover:text-white'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="pt-6 border-t border-emerald-900/50 text-center">
        <p className="text-[10px] text-emerald-500/50 font-semibold">PlantCare AI &copy; 2026</p>
      </div>
    </div>
  );
}

function MainLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar (hidden on small screen) */}
      <aside className="hidden lg:block w-64 shrink-0 shadow-xl z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/45 backdrop-blur-xs" 
            onClick={() => setMobileMenuOpen(false)}
          ></div>
          {/* Navigation Panel */}
          <aside className="relative w-64 max-w-xs h-full shadow-2xl animate-slideRight">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 text-white hover:text-emerald-400 p-2 cursor-pointer z-50"
            >
              <X size={20} />
            </button>
            <SidebarContent onClose={() => setMobileMenuOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header bar */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between lg:justify-end shrink-0">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 text-gray-500 hover:text-emerald-600 border border-gray-100 rounded-xl cursor-pointer"
          >
            <Menu size={20} />
          </button>
          
          <div className="flex items-center space-x-3">
            <span className="text-xs font-semibold text-gray-400 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-full">
              Single-User Dev Mode
            </span>
          </div>
        </header>

        {/* Dynamic Page content */}
        <main className="flex-1 overflow-y-auto px-6 py-8 md:px-10">
          <div className="max-w-6xl mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/plants" element={<PlantsCatalog />} />
              <Route path="/plants/new" element={<PlantForm />} />
              <Route path="/plants/:id" element={<PlantDetails />} />
              <Route path="/plants/:id/edit" element={<PlantForm />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <MainLayout />
    </Router>
  );
}
