import React, { useState } from 'react';
import { Settings, Lock, Save, LogOut, CheckCircle, Clock, Trash2, Plus } from 'lucide-react';
import { useConfig } from '../ConfigContext';

export const AdminPanel = () => {
  const { config, updateConfig } = useConfig();
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('adminAuth') === 'true');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Local state for forms
  const [yt1, setYt1] = useState(config.youtubeLinks[0] || '');
  const [yt2, setYt2] = useState(config.youtubeLinks[1] || '');
  const [yt3, setYt3] = useState(config.youtubeLinks[2] || '');
  const [hotmart, setHotmart] = useState(config.hotmartLink);
  const [semanal, setSemanal] = useState(config.prices.semanal.toString());
  const [quincenal, setQuincenal] = useState(config.prices.quincenal.toString());
  const [mensual, setMensual] = useState(config.prices.mensual.toString());
  const [products, setProducts] = useState(config.products || []);
  const [savedMessage, setSavedMessage] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'edinson-18972063') { // Simple hardcoded password as requested "solo para mi"
      localStorage.setItem('adminAuth', 'true');
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Contraseña incorrecta');
    }
  };

  const handleSave = () => {
    updateConfig({
      ...config,
      youtubeLinks: [yt1, yt2, yt3],
      hotmartLink: hotmart,
      prices: {
        semanal: parseInt(semanal) || 0,
        quincenal: parseInt(quincenal) || 0,
        mensual: parseInt(mensual) || 0
      },
      products: products
    });
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  const calculateFreeDays = (registrationDate: string) => {
    const start = new Date(registrationDate).getTime();
    const now = new Date().getTime();
    const diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    return Math.max(0, 90 - diffDays);
  };

  const toggleLocksmithStatus = (id: string) => {
    const updatedLocksmiths = config.locksmiths.map(l => {
      if (l.id === id) {
        return { ...l, isPaidActive: !l.isPaidActive };
      }
      return l;
    });
    updateConfig({ ...config, locksmiths: updatedLocksmiths });
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center min-h-[60vh] max-w-sm mx-auto">
        <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-6 border border-zinc-800">
          <Lock className="w-8 h-8 text-zinc-500" />
        </div>
        <h2 className="text-xl font-semibold text-zinc-100 mb-2">Acceso Restringido</h2>
        <p className="text-zinc-500 text-sm mb-8">Ingresa la contraseña maestra para editar la configuración de la app.</p>
        
        <form onSubmit={handleLogin} className="w-full relative">
          <input 
            type="password" 
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:border-[#D4AF37] transition-colors"
          />
          {error && <p className="text-red-500 text-xs mt-2 text-left">{error}</p>}
          <button 
            type="submit"
            className="w-full mt-4 bg-gradient-to-r from-[#D4AF37] to-[#8A6D3B] hover:opacity-90 text-black font-bold py-3 rounded-xl transition-all active:scale-95"
          >
            Entrar
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md mx-auto w-full pb-12">
      <div className="flex flex-col gap-4 mb-8 mt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-[#D4AF37]" />
            <h2 className="text-xl font-serif text-white">Configuración</h2>
          </div>
          <button 
            onClick={() => {
              localStorage.removeItem('adminAuth');
              setIsAuthenticated(false);
            }} 
            className="flex items-center gap-2 text-red-400 hover:text-red-300 px-3 py-2 rounded-lg bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">Cerrar sesión de administrador</span>
            <span className="text-[10px] font-bold uppercase tracking-wider sm:hidden">Cerrar sesión</span>
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {/* Videos Setting */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-[#D4AF37] uppercase tracking-wider">Enlaces de YouTube</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Video 1 (URL del embed)</label>
              <input 
                type="text" 
                value={yt1}
                onChange={(e) => setYt1(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-[#D4AF37] transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Video 2 (URL del embed)</label>
              <input 
                type="text" 
                value={yt2}
                onChange={(e) => setYt2(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-[#D4AF37] transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Video 3 (URL del embed)</label>
              <input 
                type="text" 
                value={yt3}
                onChange={(e) => setYt3(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-[#D4AF37] transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Hotmart */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-[#D4AF37] uppercase tracking-wider">Enlace de Ebook</h3>
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">URL de Checkout en Hotmart</label>
            <input 
              type="text" 
              value={hotmart}
              onChange={(e) => setHotmart(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-[#D4AF37] transition-colors"
            />
          </div>
        </div>

        {/* Prices */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-[#D4AF37] uppercase tracking-wider">Precios Cerrajero Ya (COP)</h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Semanal</label>
              <input 
                type="number" 
                value={semanal}
                onChange={(e) => setSemanal(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-2 text-sm text-zinc-100 focus:outline-none focus:border-[#D4AF37] transition-colors text-center"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Quincenal</label>
              <input 
                type="number" 
                value={quincenal}
                onChange={(e) => setQuincenal(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-2 text-sm text-zinc-100 focus:outline-none focus:border-[#D4AF37] transition-colors text-center"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Mensual</label>
              <input 
                type="number" 
                value={mensual}
                onChange={(e) => setMensual(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-2 text-sm text-zinc-100 focus:outline-none focus:border-[#D4AF37] transition-colors text-center"
              />
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-[#D4AF37] uppercase tracking-wider">Productos Tienda</h3>
            <button 
              onClick={() => setProducts([...products, { id: Date.now().toString(), name: '', image: '', price: '', link: '', category: '' }])}
              className="flex items-center gap-1 text-[10px] bg-[#D4AF37] text-black font-bold px-2 py-1 rounded uppercase hover:opacity-90 transition-opacity"
            >
              <Plus className="w-3 h-3" /> Añadir
            </button>
          </div>
          <div className="space-y-4">
            {products.map((product, index) => (
              <div key={product.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3 relative">
                <button 
                  onClick={() => setProducts(products.filter(p => p.id !== product.id))}
                  className="absolute top-4 right-4 text-zinc-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="pr-8">
                  <label className="text-xs text-zinc-500 mb-1 block">Nombre</label>
                  <input 
                    type="text" 
                    value={product.name}
                    onChange={(e) => {
                      const newProducts = [...products];
                      newProducts[index].name = e.target.value;
                      setProducts(newProducts);
                    }}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-[#D4AF37] transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Precio</label>
                    <input 
                      type="text" 
                      value={product.price}
                      onChange={(e) => {
                        const newProducts = [...products];
                        newProducts[index].price = e.target.value;
                        setProducts(newProducts);
                      }}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-[#D4AF37] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Categoría</label>
                    <input 
                      type="text" 
                      value={product.category}
                      onChange={(e) => {
                        const newProducts = [...products];
                        newProducts[index].category = e.target.value;
                        setProducts(newProducts);
                      }}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-[#D4AF37] transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">URL Imagen</label>
                  <input 
                    type="text" 
                    value={product.image}
                    onChange={(e) => {
                      const newProducts = [...products];
                      newProducts[index].image = e.target.value;
                      setProducts(newProducts);
                    }}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-[#D4AF37] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">URL Link Afiliado</label>
                  <input 
                    type="text" 
                    value={product.link}
                    onChange={(e) => {
                      const newProducts = [...products];
                      newProducts[index].link = e.target.value;
                      setProducts(newProducts);
                    }}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-[#D4AF37] transition-colors"
                  />
                </div>
              </div>
            ))}
            {products.length === 0 && (
              <p className="text-zinc-500 text-xs text-center py-2">No hay productos. Añade uno nuevo.</p>
            )}
          </div>
        </div>

        {/* Cerrajeros Registrados */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-[#D4AF37] uppercase tracking-wider">Cerrajeros Registrados ({config.locksmiths?.length || 0})</h3>
          <div className="space-y-3">
            {config.locksmiths?.map(locksmith => {
              const freeDays = calculateFreeDays(locksmith.registrationDate);
              const isActive = locksmith.isPaidActive || freeDays > 0;
              return (
                <div key={locksmith.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-zinc-100 font-bold text-sm">{locksmith.name}</h4>
                      <p className="text-zinc-500 text-xs">{locksmith.phone} • {locksmith.zone}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${isActive ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'bg-red-500/20 text-red-400'}`}>
                        {isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-zinc-800 text-xs text-zinc-400">
                    <Clock className="w-3 h-3" />
                    <span>Registro: {new Date(locksmith.registrationDate).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className={freeDays > 0 ? 'text-[#D4AF37]' : 'text-red-400'}>{freeDays} días gratis</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-zinc-500">Plan: {locksmith.selectedPlan ? locksmith.selectedPlan.toUpperCase() : 'Ninguno'}</span>
                    <button 
                      onClick={() => toggleLocksmithStatus(locksmith.id)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${locksmith.isPaidActive ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700' : 'bg-[#D4AF37] text-black hover:opacity-90'}`}
                    >
                      <CheckCircle className="w-4 h-4" />
                      {locksmith.isPaidActive ? 'Marcar como Impago' : 'Marcar como Pagado'}
                    </button>
                  </div>
                </div>
              );
            })}
            {(!config.locksmiths || config.locksmiths.length === 0) && (
              <p className="text-zinc-500 text-sm py-4 text-center">No hay cerrajeros registrados aún.</p>
            )}
          </div>
        </div>

        {/* Save */}
        <div className="pt-4 pb-20">
          <button 
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#8A6D3B] hover:opacity-90 text-black font-bold py-4 rounded-xl transition-all active:scale-95"
          >
            <Save className="w-5 h-5" />
            <span>Guardar Cambios</span>
          </button>
          {savedMessage && (
            <p className="text-[#D4AF37] text-center text-sm mt-3 font-bold animate-pulse">¡Configuración guardada exitosamente!</p>
          )}
        </div>
      </div>
    </div>
  );
};
