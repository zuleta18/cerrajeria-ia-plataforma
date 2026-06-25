import React, { useState } from 'react';
import { Home, BookOpen, MapPin, ShoppingCart, Play, Book, Settings, Key } from 'lucide-react';
import { ViewType } from './types';
import { ConfigProvider } from './ConfigContext';
import { BannerAd } from './components/BannerAds';

// Views
import { Inicio } from './views/Inicio';
import { Academia } from './views/Academia';
import { CerrajeroYa } from './views/CerrajeroYa';
import { Tienda } from './views/Tienda';
import { Videos } from './views/Videos';
import { EbookPremium } from './views/EbookPremium';
import { AdminPanel } from './views/AdminPanel';
import { PoliticaPrivacidad } from './views/PoliticaPrivacidad';
import { TerminosCondiciones } from './views/TerminosCondiciones';

import { PortalCerrajero } from './views/PortalCerrajero';

function AppContent() {
  const [currentView, setCurrentView] = useState<ViewType>('Inicio');

  const renderView = () => {
    switch (currentView) {
      case 'Inicio': return <Inicio navigate={setCurrentView} />;
      case 'Academia': return <Academia />;
      case 'CerrajeroYa': return <CerrajeroYa navigate={setCurrentView} />;
      case 'Tienda': return <Tienda />;
      case 'Videos': return <Videos />;
      case 'EbookPremium': return <EbookPremium />;
      case 'AdminPanel': return <AdminPanel />;
      case 'PortalCerrajero': return <PortalCerrajero />;
      case 'PoliticaPrivacidad': return <PoliticaPrivacidad />;
      case 'TerminosCondiciones': return <TerminosCondiciones />;
      default: return <Inicio navigate={setCurrentView} />;
    }
  };

  const navItems: { label: string; view: ViewType; icon: React.ReactNode }[] = [
    { label: 'Inicio', view: 'Inicio', icon: <Home /> },
    { label: 'Academia', view: 'Academia', icon: <BookOpen /> },
    { label: 'Ubicación', view: 'CerrajeroYa', icon: <MapPin /> },
    { label: 'Tienda', view: 'Tienda', icon: <ShoppingCart /> },
    { label: 'Videos', view: 'Videos', icon: <Play /> },
    { label: 'Ebook', view: 'EbookPremium', icon: <Book /> },
  ];

  return (
    <div className="bg-[#050505] text-white min-h-screen font-sans flex flex-col selection:bg-[#D4AF37]/30">
      
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-[#0a0a0a] border-b border-[#D4AF37]/30 shrink-0">
        <div className="flex items-center gap-2" onClick={() => setCurrentView('Inicio')} style={{ cursor: 'pointer' }}>
          <div className="w-8 h-8 bg-gradient-to-br from-[#D4AF37] to-[#8A6D3B] rounded-lg flex items-center justify-center">
            <Key className="w-5 h-5 text-black" />
          </div>
          <h1 className="text-xl font-serif italic text-[#D4AF37] tracking-tight">CerrajeríaIA</h1>
        </div>
        <button 
          onClick={() => setCurrentView('AdminPanel')}
          className="px-3 py-1.5 text-[10px] border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-colors rounded uppercase font-bold"
        >
          Admin
        </button>
      </header>

      <div className="flex-1 overflow-y-auto pb-24 bg-[radial-gradient(circle_at_center,_#1a1a1a_0%,_#050505_100%)]">
        {currentView === 'Inicio' && <BannerAd className="mt-4 mx-4 mb-2 max-w-full" />}
        {renderView()}
        {currentView !== 'Inicio' && <BannerAd className="mx-4 mb-4 max-w-full" />}
        
        {/* Footer */}
        <footer className="mt-8 mb-4 pb-4 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 border-t border-zinc-900 pt-6">
          <button 
            onClick={() => setCurrentView('PoliticaPrivacidad')}
            className="text-xs text-zinc-500 hover:text-[#D4AF37] transition-colors underline decoration-zinc-700 underline-offset-4"
          >
            Política de Privacidad
          </button>
          <button 
            onClick={() => setCurrentView('TerminosCondiciones')}
            className="text-xs text-zinc-500 hover:text-[#D4AF37] transition-colors underline decoration-zinc-700 underline-offset-4"
          >
            Términos y Condiciones
          </button>
        </footer>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 inset-x-0 h-20 bg-[#0a0a0a] border-t border-zinc-800 z-50">
        <div className="flex justify-between items-center h-full px-2 overflow-x-auto custom-scrollbar max-w-md mx-auto">
          {navItems.map(item => {
            const isActive = currentView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => setCurrentView(item.view)}
                className={`flex flex-col items-center justify-center min-w-[64px] gap-1 transition-colors px-2 ${
                  isActive ? 'text-[#D4AF37]' : 'text-zinc-500 hover:text-white'
                }`}
              >
                {React.cloneElement(item.icon as React.ReactElement, { className: 'w-6 h-6' })}
                <span className={`text-[10px] uppercase tracking-tighter ${isActive ? 'font-bold' : ''}`}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <ConfigProvider>
      <AppContent />
    </ConfigProvider>
  );
}
