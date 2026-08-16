import React, { useState } from 'react';
import { usePOS } from '../context/POSContext';
import { useAuth, NavTab } from '../context/AuthContext';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { 
  ShoppingBag, 
  ChefHat,
  UtensilsCrossed, 
  Receipt, 
  BarChart3, 
  Calculator, 
  IceCream, 
  WifiOff,
  LogOut,
  User as UserIcon,
  ShieldCheck,
  Briefcase,
  Users,
  ChevronDown,
  Menu as MenuIcon,
  X,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { UserManagementModal } from './UserManagementModal';

interface Props {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenCalculator: () => void;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  onOpenCalculator,
}) => {
  const { cartItemCount, pendingKitchenCount, metrics, businessSettings } = usePOS();
  const { user, userProfile, role, logout, hasPermission, canManageUsers } = useAuth();
  const { isOnline } = useNetworkStatus();
  
  const [showLeftMenu, setShowLeftMenu] = useState<boolean>(false);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [showUsersModal, setShowUsersModal] = useState<boolean>(false);

  const getRoleStyle = () => {
    switch (role) {
      case 'CEO':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'Supervisor':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'Cajero':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Cocinero':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  const getActiveTabLabel = () => {
    switch (activeTab) {
      case 'pos': return 'Vender (Caja)';
      case 'kitchen': return 'Cocina / KDS';
      case 'menu': return 'Catálogo & Menú';
      case 'history': return 'Historial de Ventas';
      case 'reports': return 'Cierre & Reportes';
      default: return '';
    }
  };

  const handleNavigate = (tab: NavTab) => {
    onSelectTab(tab);
    setShowLeftMenu(false);
  };

  return (
    <header id="navbar-header" className="bg-slate-900 text-white border-b border-slate-800 shrink-0 sticky top-0 z-30 select-none no-print">
      <div className="w-full max-w-[1920px] mx-auto px-2.5 sm:px-4 h-12 flex items-center justify-between gap-2 sm:gap-3">
        
        {/* Left Section: Menu Toggle + Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Left Dropdown Menu Trigger Button */}
          <button
            type="button"
            id="left-menu-toggle-btn"
            onClick={() => setShowLeftMenu(!showLeftMenu)}
            className={`h-8 px-2 sm:px-2.5 flex items-center gap-1.5 rounded-lg border text-xs font-bold transition cursor-pointer shadow-2xs ${
              showLeftMenu 
                ? 'bg-orange-600 border-orange-500 text-white shadow-xs' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border-slate-700/80'
            }`}
            title="Abrir menú de navegación lateral"
          >
            {showLeftMenu ? (
              <X className="w-4 h-4 text-white" />
            ) : (
              <MenuIcon className="w-4 h-4 text-orange-400" />
            )}
            <span className="font-bold">Menú</span>
          </button>

          {/* Simplified Brand & Logo */}
          <button
            type="button"
            id="brand-logo-btn"
            className="flex items-center gap-2 shrink-0 cursor-pointer select-none text-left bg-transparent border-0 p-0 hover:opacity-90 transition" 
            onClick={() => {
              if (hasPermission('pos')) onSelectTab('pos');
              else if (hasPermission('kitchen')) onSelectTab('kitchen');
            }}
            title="Friska POS"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-orange-500 via-amber-500 to-rose-500 flex items-center justify-center shadow-xs shrink-0">
              <IceCream className="w-4 h-4 text-white stroke-[2.2]" />
            </div>
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="font-black text-sm sm:text-base tracking-tight text-white leading-none">
                Friska <span className="text-orange-400">POS</span>
              </span>
              {!isOnline && (
                <span className="inline-flex items-center gap-1 bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[9px] font-bold px-1.5 py-0.5 rounded animate-pulse leading-none">
                  <WifiOff className="w-2.5 h-2.5 text-amber-400" />
                  Offline
                </span>
              )}
            </div>
          </button>
        </div>

        {/* Center: Current Module Indicator Pill */}
        <div className="hidden sm:flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/70 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-300">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span className="text-slate-400 text-[11px]">Módulo:</span>
            <span className="text-white font-bold">{getActiveTabLabel()}</span>
          </div>
        </div>

        {/* Right Tools & User Info (Ultra-Compact) */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Quick Change Calculator Button */}
          {hasPermission('pos') && (
            <button
              type="button"
              id="quick-calc-nav-btn"
              onClick={onOpenCalculator}
              className="h-7 sm:h-8 px-1.5 sm:px-2 flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 rounded-lg border border-slate-700 transition cursor-pointer shadow-2xs font-bold text-xs"
              title="Calculadora rápida de vueltos"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-[10px]">Calc</span>
            </button>
          )}

          {/* Shift Drawer Balance Button */}
          {hasPermission('reports') && (
            <button
              type="button"
              id="shift-balance-nav-btn" 
              onClick={() => onSelectTab('reports')}
              className="h-7 sm:h-8 px-2 hidden 2xl:flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/70 rounded-lg text-[10px] cursor-pointer transition shadow-2xs"
              title="Total ventas netas en el turno actual"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-400">Turno:</span>
              <span className="font-bold text-emerald-400">${metrics.netSales.toFixed(2)}</span>
            </button>
          )}

          {/* Authenticated User Menu Dropdown Button (Ultra-Compact Role Pill) */}
          <div className="relative">
            <button
              type="button"
              id="user-profile-menu-btn"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="h-7 sm:h-8 flex items-center gap-1 bg-slate-800 hover:bg-slate-700/90 border border-slate-700/80 px-1.5 rounded-lg transition cursor-pointer shadow-2xs"
              title={`Sesión activa: ${userProfile?.displayName || 'Admin'} (${role})`}
            >
              <div className="w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-md bg-gradient-to-tr from-orange-500 to-amber-400 text-white font-black text-[9px] flex items-center justify-center shadow-xs shrink-0">
                {userProfile?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'A'}
              </div>
              <span className={`text-[8px] sm:text-[9px] font-black tracking-wider px-1 py-0.2 rounded border uppercase ${getRoleStyle()}`}>
                {role}
              </span>
              <ChevronDown className="w-2.5 h-2.5 text-slate-400 shrink-0" />
            </button>

            {/* Dropdown Menu Box */}
            {showUserMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowUserMenu(false)} 
                />
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl z-50 p-2 text-xs divide-y divide-slate-800 animate-in fade-in zoom-in-95 duration-150">
                  
                  {/* User Profile Header */}
                  <div className="p-3">
                    <div className="font-bold text-white text-sm truncate">
                      {userProfile?.displayName || 'Usuario Friska'}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                      {user?.email}
                    </div>
                    <div className="mt-2 flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRoleStyle()}`}>
                        Rol: {role}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="py-2 space-y-1">
                    {canManageUsers && (
                      <button
                        type="button"
                        id="manage-roles-btn"
                        onClick={() => {
                          setShowUserMenu(false);
                          setShowUsersModal(true);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-2 cursor-pointer"
                      >
                        <Users className="w-4 h-4 text-purple-400" />
                        <span>Administrar Usuarios (RBAC)</span>
                      </button>
                    )}
                  </div>

                  {/* Logout Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      id="logout-btn"
                      onClick={async () => {
                        setShowUserMenu(false);
                        await logout();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition flex items-center gap-2 cursor-pointer font-bold"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>

                </div>
              </>
            )}
          </div>

        </div>
      </div>

      {/* LEFT SIDE DROPDOWN / DRAWER MENU */}
      {showLeftMenu && (
        <>
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 animate-in fade-in duration-200"
            onClick={() => setShowLeftMenu(false)}
          />

          {/* Left Menu Panel */}
          <div className="fixed top-12 left-0 w-72 sm:w-80 h-[calc(100vh-3rem)] bg-slate-900 border-r border-slate-800 shadow-2xl z-50 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-200">
            
            {/* Header / Brand info inside Drawer */}
            <div className="p-4 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 via-amber-500 to-rose-500 flex items-center justify-center shadow-md">
                    <IceCream className="w-4.5 h-4.5 text-white stroke-[2.2]" />
                  </div>
                  <div>
                    <h2 className="font-black text-white text-base tracking-tight leading-none">
                      Friska <span className="text-orange-400">POS</span>
                    </h2>
                    <p className="text-[10px] text-slate-400 mt-0.5">Sistema de Punto de Venta</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLeftMenu(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                  title="Cerrar menú"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Navigation Modules List */}
            <div className="p-3 space-y-1.5 flex-1">
              <div className="px-2 py-1 text-[10px] font-black tracking-wider text-slate-400 uppercase">
                Módulos del Sistema
              </div>

              {/* Vender / POS */}
              {hasPermission('pos') && (
                <button
                  type="button"
                  id="drawer-nav-pos"
                  onClick={() => handleNavigate('pos')}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all duration-150 cursor-pointer ${
                    activeTab === 'pos'
                      ? 'bg-orange-600 text-white shadow-sm font-bold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${activeTab === 'pos' ? 'bg-white/20' : 'bg-slate-800 text-orange-400'}`}>
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-sm">Vender</div>
                      <div className={`text-[11px] ${activeTab === 'pos' ? 'text-orange-100' : 'text-slate-400'}`}>
                        Punto de Venta / Caja
                      </div>
                    </div>
                  </div>
                  {cartItemCount > 0 && (
                    <span className="bg-white text-orange-700 text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                      {cartItemCount}
                    </span>
                  )}
                </button>
              )}

              {/* Cocina / KDS */}
              {hasPermission('kitchen') && (
                <button
                  type="button"
                  id="drawer-nav-kitchen"
                  onClick={() => handleNavigate('kitchen')}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all duration-150 cursor-pointer ${
                    activeTab === 'kitchen'
                      ? 'bg-orange-600 text-white shadow-sm font-bold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${activeTab === 'kitchen' ? 'bg-white/20' : 'bg-slate-800 text-amber-400'}`}>
                      <ChefHat className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-sm">Cocina / KDS</div>
                      <div className={`text-[11px] ${activeTab === 'kitchen' ? 'text-orange-100' : 'text-slate-400'}`}>
                        Preparación de pedidos
                      </div>
                    </div>
                  </div>
                  {pendingKitchenCount > 0 && (
                    <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse shadow-xs">
                      {pendingKitchenCount}
                    </span>
                  )}
                </button>
              )}

              {/* Catálogo / Menú */}
              {hasPermission('menu') && (
                <button
                  type="button"
                  id="drawer-nav-menu"
                  onClick={() => handleNavigate('menu')}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all duration-150 cursor-pointer ${
                    activeTab === 'menu'
                      ? 'bg-orange-600 text-white shadow-sm font-bold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${activeTab === 'menu' ? 'bg-white/20' : 'bg-slate-800 text-rose-400'}`}>
                      <UtensilsCrossed className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-sm">Catálogo & Menú</div>
                      <div className={`text-[11px] ${activeTab === 'menu' ? 'text-orange-100' : 'text-slate-400'}`}>
                        Productos y precios
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </button>
              )}

              {/* Historial de Ventas */}
              {hasPermission('history') && (
                <button
                  type="button"
                  id="drawer-nav-history"
                  onClick={() => handleNavigate('history')}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all duration-150 cursor-pointer ${
                    activeTab === 'history'
                      ? 'bg-orange-600 text-white shadow-sm font-bold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${activeTab === 'history' ? 'bg-white/20' : 'bg-slate-800 text-sky-400'}`}>
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-sm">Historial de Ventas</div>
                      <div className={`text-[11px] ${activeTab === 'history' ? 'text-orange-100' : 'text-slate-400'}`}>
                        Tickets y reimpresión
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </button>
              )}

              {/* Cierre de Caja y Reportes */}
              {hasPermission('reports') && (
                <button
                  type="button"
                  id="drawer-nav-reports"
                  onClick={() => handleNavigate('reports')}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all duration-150 cursor-pointer ${
                    activeTab === 'reports'
                      ? 'bg-orange-600 text-white shadow-sm font-bold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${activeTab === 'reports' ? 'bg-white/20' : 'bg-slate-800 text-emerald-400'}`}>
                      <BarChart3 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-sm">Cierre & Reportes</div>
                      <div className={`text-[11px] ${activeTab === 'reports' ? 'text-orange-100' : 'text-slate-400'}`}>
                        Arqueo y estadísticas
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </button>
              )}

              {/* Quick Tools Section */}
              <div className="pt-3">
                <div className="px-2 py-1 text-[10px] font-black tracking-wider text-slate-400 uppercase">
                  Herramientas Rápidas
                </div>

                {hasPermission('pos') && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowLeftMenu(false);
                      onOpenCalculator();
                    }}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left text-slate-300 hover:bg-slate-800 hover:text-white transition cursor-pointer"
                  >
                    <div className="p-2 rounded-lg bg-slate-800 text-emerald-400">
                      <Calculator className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-sm">Calculadora de Vueltos</div>
                      <div className="text-[11px] text-slate-400">Calcula cambio al instante</div>
                    </div>
                  </button>
                )}

                {canManageUsers && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowLeftMenu(false);
                      setShowUsersModal(true);
                    }}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left text-slate-300 hover:bg-slate-800 hover:text-white transition cursor-pointer"
                  >
                    <div className="p-2 rounded-lg bg-slate-800 text-purple-400">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-sm">Gestión de Usuarios (RBAC)</div>
                      <div className="text-[11px] text-slate-400">Control de roles y accesos</div>
                    </div>
                  </button>
                )}
              </div>
            </div>

            {/* Bottom User Info & Logout inside Drawer */}
            <div className="p-3 border-t border-slate-800 bg-slate-900/90">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/80 border border-slate-700/60">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-orange-500 to-amber-400 text-white font-black text-xs flex items-center justify-center shrink-0">
                    {userProfile?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">
                      {userProfile?.displayName || 'Usuario Friska'}
                    </div>
                    <span className={`text-[9px] font-black px-1.5 py-0.2 rounded border uppercase ${getRoleStyle()}`}>
                      {role}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    setShowLeftMenu(false);
                    await logout();
                  }}
                  className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 rounded-lg transition cursor-pointer"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </>
      )}

      {/* User Management Modal */}
      {showUsersModal && (
        <UserManagementModal 
          isOpen={showUsersModal} 
          onClose={() => setShowUsersModal(false)} 
        />
      )}
    </header>
  );
};
