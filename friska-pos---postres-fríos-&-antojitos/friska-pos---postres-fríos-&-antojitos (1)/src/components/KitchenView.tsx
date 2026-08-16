import React, { useState, useEffect, useRef } from 'react';
import { usePOS } from '../context/POSContext';
import { Sale, KitchenStatus } from '../types';
import { 
  ChefHat, 
  Clock, 
  CheckCircle2, 
  Hourglass, 
  Bell, 
  ShoppingBag, 
  UtensilsCrossed, 
  Search, 
  Sparkles,
  AlertCircle,
  Check,
  Flame,
  Filter,
  ArrowRight,
  RefreshCw,
  Eye,
  Volume2,
  VolumeX,
  Plus
} from 'lucide-react';
import { soundManager } from '../utils/sound';

type KitchenFilter = 'pendientes' | 'todas' | 'completadas';

export const KitchenView: React.FC = () => {
  const { sales, updateKitchenStatus, businessSettings } = usePOS();
  const [filter, setFilter] = useState<KitchenFilter>('pendientes');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('friska_kds_sound_enabled');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  // Track known order IDs to detect when a newly added order arrives in 'preparando'
  const knownOrderIdsRef = useRef<Set<string>>(new Set(sales.map(s => s.id)));
  const isInitialMountRef = useRef<boolean>(true);

  // Toggle sound and persist
  const toggleSound = () => {
    setSoundEnabled(prev => {
      const next = !prev;
      try {
        localStorage.setItem('friska_kds_sound_enabled', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      if (next) {
        soundManager.playNewOrderChime();
      }
      return next;
    });
  };

  // Test chime manually
  const handleTestSound = () => {
    soundManager.playNewOrderChime();
  };

  // Live timer tick every 1 second to update elapsed time badges accurately
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Listen for new orders with status 'preparando' and play audio alert
  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }

    const currentPrepSales = sales.filter(
      s => s.status !== 'cancelada' && (s.kitchenStatus || 'preparando') === 'preparando'
    );

    // Check if there are any new sales that were not in knownOrderIdsRef
    const hasNewPrepOrder = currentPrepSales.some(s => !knownOrderIdsRef.current.has(s.id));

    if (hasNewPrepOrder && soundEnabled) {
      soundManager.playNewOrderChime();
    }

    // Update known set
    knownOrderIdsRef.current = new Set(sales.map(s => s.id));
  }, [sales, soundEnabled]);

  // Filter out canceled sales
  const validSales = sales.filter(s => s.status !== 'cancelada');

  // Filter by status
  const filteredSales = validSales.filter(sale => {
    const currentKitchenStatus: KitchenStatus = sale.kitchenStatus || 'preparando';
    
    // Status filter
    if (filter === 'pendientes') {
      if (currentKitchenStatus === 'entregado') return false;
    } else if (filter === 'completadas') {
      if (currentKitchenStatus !== 'entregado') return false;
    }

    // Text Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const orderNum = `#${String(sale.orderNumber).padStart(3, '0')}`.toLowerCase();
      const idMatch = sale.id.toLowerCase().includes(q);
      const nameMatch = (sale.customerName || '').toLowerCase().includes(q);
      const numMatch = orderNum.includes(q) || String(sale.orderNumber).includes(q);
      const itemMatch = sale.items.some(item => item.name.toLowerCase().includes(q));
      return idMatch || nameMatch || numMatch || itemMatch;
    }

    return true;
  });

  // Calculate quick count metrics
  const countPreparando = validSales.filter(s => (s.kitchenStatus || 'preparando') === 'preparando').length;
  const countListos = validSales.filter(s => s.kitchenStatus === 'listo').length;
  const countPendientes = countPreparando + countListos;
  const countEntregados = validSales.filter(s => s.kitchenStatus === 'entregado').length;

  // Helper function for elapsed time formatting and alert colors
  const getElapsedInfo = (timestamp: number) => {
    const diffMs = Math.max(0, currentTime - timestamp);
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const remainingSec = diffSec % 60;

    let timeText = '';
    if (diffMin < 1) {
      timeText = `${diffSec}s`;
    } else if (diffMin < 60) {
      timeText = `${diffMin}m ${remainingSec}s`;
    } else {
      const diffHours = Math.floor(diffMin / 60);
      timeText = `${diffHours}h ${diffMin % 60}m`;
    }

    // Determine urgency level
    let urgency: 'normal' | 'warning' | 'critical' = 'normal';
    if (diffMin >= 10) {
      urgency = 'critical'; // > 10 min
    } else if (diffMin >= 5) {
      urgency = 'warning'; // 5-10 min
    }

    return { timeText, diffMin, urgency };
  };

  return (
    <div className="flex-1 bg-slate-900 text-slate-100 flex flex-col overflow-hidden">
      {/* Top Header & Metrics Bar */}
      <div className="bg-slate-950/90 border-b border-slate-800 px-4 py-3 shrink-0">
        <div className="w-full max-w-[1920px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Title & Live Status Indicator */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                  Pantalla de Cocina / KDS
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  En Vivo
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Gestión y despacho de postres fríos y antojitos en tiempo real
              </p>
            </div>
          </div>

          {/* Quick Counter Pills & Audio Alert Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Preparando */}
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl">
              <Hourglass className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
              <div className="text-xs">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">En Preparación</span>
                <span className="font-black text-amber-400 text-sm">{countPreparando}</span>
              </div>
            </div>

            {/* Listos */}
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
              <Bell className="w-4 h-4 text-emerald-400" />
              <div className="text-xs">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Listos</span>
                <span className="font-black text-emerald-400 text-sm">{countListos}</span>
              </div>
            </div>

            {/* Total Pendientes */}
            <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl">
              <Flame className="w-4 h-4 text-orange-400" />
              <div className="text-xs">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Pendientes</span>
                <span className="font-black text-white text-sm">{countPendientes}</span>
              </div>
            </div>

            {/* Sound Notification Alert Toggle Button */}
            <div className="flex items-center gap-1 bg-slate-800/90 border border-slate-700 p-1 rounded-xl">
              <button
                type="button"
                id="kds-sound-toggle-btn"
                onClick={toggleSound}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  soundEnabled
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                    : 'bg-slate-700/50 text-slate-400 border border-slate-600/40 hover:text-white'
                }`}
                title={soundEnabled ? 'Alerta sonora de nuevas órdenes ACTIVA (clic para silenciar)' : 'Alerta sonora SILENCIADA (clic para activar)'}
              >
                {soundEnabled ? (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Alerta ON</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                    <span>Silencio</span>
                  </>
                )}
              </button>

              <button
                type="button"
                id="kds-sound-test-btn"
                onClick={handleTestSound}
                className="px-2 py-1 text-slate-400 hover:text-amber-300 hover:bg-slate-700 rounded-lg text-xs transition cursor-pointer"
                title="Probar sonido de campana KDS"
              >
                🔔 Probar
              </button>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="w-full max-w-[1920px] mx-auto mt-3 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          
          {/* Main Status Filters: Pendientes, Todas, Completadas */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
            <button
              type="button"
              id="kds-filter-pendientes"
              onClick={() => setFilter('pendientes')}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                filter === 'pendientes'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>Pendientes</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                filter === 'pendientes' ? 'bg-orange-700 text-white' : 'bg-slate-800 text-slate-300'
              }`}>
                {countPendientes}
              </span>
            </button>

            <button
              type="button"
              id="kds-filter-todas"
              onClick={() => setFilter('todas')}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                filter === 'todas'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>Todas</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                filter === 'todas' ? 'bg-orange-700 text-white' : 'bg-slate-800 text-slate-300'
              }`}>
                {validSales.length}
              </span>
            </button>

            <button
              type="button"
              id="kds-filter-completadas"
              onClick={() => setFilter('completadas')}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                filter === 'completadas'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>Completadas</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                filter === 'completadas' ? 'bg-orange-700 text-white' : 'bg-slate-800 text-slate-300'
              }`}>
                {countEntregados}
              </span>
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              id="kds-search-input"
              value={searchQuery ?? ''}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar # orden, cliente o producto..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-orange-500 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Orders Board Grid */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-900/60">
        <div className="w-full max-w-[1920px] mx-auto">
          {filteredSales.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-500 mb-4">
                <ChefHat className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">
                {filter === 'pendientes'
                  ? '¡No hay pedidos pendientes!'
                  : filter === 'completadas'
                  ? 'No hay pedidos completados aún'
                  : 'No se encontraron pedidos'}
              </h3>
              <p className="text-sm text-slate-400 max-w-sm">
                {filter === 'pendientes'
                  ? 'Todos los pedidos de postres fríos y antojitos han sido preparados y entregados.'
                  : 'Los nuevos pedidos registrados desde la pantalla de venta aparecerán aquí automáticamente.'}
              </p>
            </div>
          ) : (
            /* Order Cards Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-5">
              {filteredSales.map(sale => {
                const currentStatus: KitchenStatus = sale.kitchenStatus || 'preparando';
                const orderCreatedAt = sale.createdAt || sale.timestamp;
                const { timeText, urgency } = getElapsedInfo(orderCreatedAt);
                const orderNumberFormatted = `#${String(sale.orderNumber).padStart(3, '0')}`;
                const isTakeout = sale.orderType === 'llevar';
                const orderDate = new Date(orderCreatedAt);
                const orderTimeStr = orderDate.toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                // Status colors & styles
                const isPreparing = currentStatus === 'preparando';
                const isReady = currentStatus === 'listo';
                const isDelivered = currentStatus === 'entregado';

                return (
                  <div
                    key={sale.id}
                    id={`kds-card-${sale.id}`}
                    className={`rounded-2xl border flex flex-col transition shadow-lg overflow-hidden ${
                      isReady
                        ? 'bg-slate-800/95 border-emerald-500/80 ring-2 ring-emerald-500/20'
                        : isPreparing
                        ? urgency === 'critical'
                          ? 'bg-slate-800/95 border-rose-500/80 ring-2 ring-rose-500/20'
                          : urgency === 'warning'
                          ? 'bg-slate-800/95 border-amber-500/80 ring-2 ring-amber-500/20'
                          : 'bg-slate-800/90 border-slate-700 hover:border-orange-500/50'
                        : 'bg-slate-900/60 border-slate-800 opacity-75'
                    }`}
                  >
                    {/* Card Top Header */}
                    <div className={`p-4 border-b flex items-start justify-between gap-2 ${
                      isReady 
                        ? 'bg-emerald-950/40 border-emerald-800/40' 
                        : isPreparing && urgency === 'critical'
                        ? 'bg-rose-950/40 border-rose-800/40'
                        : isPreparing && urgency === 'warning'
                        ? 'bg-amber-950/40 border-amber-800/40'
                        : 'bg-slate-800/60 border-slate-700/60'
                    }`}>
                      <div>
                        {/* Order Number & Time */}
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-black text-white tracking-tight font-mono">
                            {orderNumberFormatted}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            {orderTimeStr}
                          </span>
                        </div>

                        {/* Customer Name */}
                        <div className="text-sm font-bold text-slate-100 mt-0.5 truncate max-w-[190px]" title={sale.customerName}>
                          👤 {sale.customerName || 'Cliente General'}
                        </div>
                      </div>

                      {/* Order Type Badge: Para Llevar 🛍️ vs Comer Aquí 🍽️ */}
                      <div className="flex flex-col items-end gap-1.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black tracking-wide uppercase ${
                            isTakeout
                              ? 'bg-indigo-500 text-white shadow-xs'
                              : 'bg-teal-500 text-slate-950 font-black shadow-xs'
                          }`}
                        >
                          {isTakeout ? (
                            <>
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>Para Llevar</span>
                            </>
                          ) : (
                            <>
                              <UtensilsCrossed className="w-3.5 h-3.5" />
                              <span>Comer Aquí</span>
                            </>
                          )}
                        </span>

                        {/* Elapsed Timer Counter */}
                        <div
                          className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md font-mono ${
                            isDelivered
                              ? 'bg-slate-800 text-slate-400'
                              : urgency === 'critical'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                              : urgency === 'warning'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-slate-700/60 text-slate-300'
                          }`}
                          title={`Tomado a las ${orderTimeStr}`}
                        >
                          <Clock className="w-3 h-3 shrink-0" />
                          <span>{timeText}</span>
                        </div>
                      </div>
                    </div>

                    {/* Order Items List */}
                    <div className="p-3.5 flex-1 space-y-2.5 divide-y divide-slate-700/40">
                      {sale.items.map((item, idx) => (
                        <div key={item.uid || idx} className={`${idx > 0 ? 'pt-2.5' : ''}`}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2">
                              {/* Quantity Badge */}
                              <span className="w-6 h-6 rounded-md bg-orange-500/20 border border-orange-500/40 text-orange-400 font-black text-xs flex items-center justify-center shrink-0">
                                {item.quantity}x
                              </span>
                              <div>
                                <span className="font-bold text-sm text-white leading-tight block">
                                  {item.name}
                                </span>

                                {/* Selected Toppings / Extras */}
                                {item.selectedToppings && item.selectedToppings.length > 0 && (
                                  <div className="mt-1 flex flex-wrap gap-1">
                                    {item.selectedToppings.map(t => (
                                      <span
                                        key={t.id}
                                        className="inline-flex items-center text-[11px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded"
                                      >
                                        +{t.name}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {/* Special Notes for Preparation */}
                                {item.notes && (
                                  <div className="mt-1 text-[11px] text-amber-200 bg-amber-950/40 border border-amber-700/40 px-2 py-0.5 rounded italic">
                                    📝 "{item.notes}"
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Preparation Status Quick Action Buttons */}
                    <div className="p-3 bg-slate-950/60 border-t border-slate-800 space-y-2">
                      {/* Current Status Pill */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-medium">Estado actual:</span>
                        {isPreparing && (
                          <span className="inline-flex items-center gap-1 font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                            <Hourglass className="w-3 h-3" />
                            En Preparación
                          </span>
                        )}
                        {isReady && (
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20 animate-pulse">
                            <Bell className="w-3 h-3" />
                            Listo para Entregar
                          </span>
                        )}
                        {isDelivered && (
                          <span className="inline-flex items-center gap-1 font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            Entregado
                          </span>
                        )}
                      </div>

                      {/* 3 Quick State Action Buttons */}
                      <div className="grid grid-cols-3 gap-1.5 pt-1">
                        {/* 1. En Preparación ⏳ */}
                        <button
                          type="button"
                          id={`kds-btn-prep-${sale.id}`}
                          onClick={() => updateKitchenStatus(sale.id, 'preparando')}
                          className={`py-1.5 px-1 rounded-xl text-[11px] font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition cursor-pointer ${
                            isPreparing
                              ? 'bg-amber-500 text-slate-950 font-black ring-2 ring-amber-400/50 shadow-xs'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                          }`}
                          title="Marcar como En Preparación"
                        >
                          <Hourglass className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">Preparando</span>
                        </button>

                        {/* 2. Listo para Entregar 🔔 */}
                        <button
                          type="button"
                          id={`kds-btn-ready-${sale.id}`}
                          onClick={() => updateKitchenStatus(sale.id, 'listo')}
                          className={`py-1.5 px-1 rounded-xl text-[11px] font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition cursor-pointer ${
                            isReady
                              ? 'bg-emerald-500 text-slate-950 font-black ring-2 ring-emerald-400/50 shadow-xs'
                              : 'bg-slate-800 text-slate-300 hover:bg-emerald-900/60 hover:text-emerald-300 border border-slate-700'
                          }`}
                          title="Marcar como Listo para Entregar"
                        >
                          <Bell className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">¡Listo!</span>
                        </button>

                        {/* 3. Entregado / Finalizado ✅ */}
                        <button
                          type="button"
                          id={`kds-btn-done-${sale.id}`}
                          onClick={() => updateKitchenStatus(sale.id, 'entregado')}
                          className={`py-1.5 px-1 rounded-xl text-[11px] font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition cursor-pointer ${
                            isDelivered
                              ? 'bg-slate-700 text-white font-bold ring-2 ring-slate-500/50'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                          }`}
                          title="Marcar como Entregado / Finalizado"
                        >
                          <Check className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">Entregado</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
