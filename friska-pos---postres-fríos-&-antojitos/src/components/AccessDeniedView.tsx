import React from 'react';
import { ShieldAlert, ArrowLeft, Lock, UserCheck } from 'lucide-react';
import { useAuth, NavTab } from '../context/AuthContext';

interface Props {
  tabName: NavTab;
  onNavigateToAllowed: () => void;
}

export const AccessDeniedView: React.FC<Props> = ({ tabName, onNavigateToAllowed }) => {
  const { role, userProfile } = useAuth();

  const tabLabels: Record<NavTab, string> = {
    pos: 'Punto de Venta (Caja)',
    kitchen: 'Pantalla de Cocina / KDS',
    menu: 'Administración del Menú y Catálogo',
    history: 'Historial de Ventas',
    reports: 'Cierre de Caja y Reportes Financieros',
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 min-h-[400px]">
      <div className="bg-white border border-slate-200 shadow-xl rounded-3xl p-6 sm:p-8 max-w-md w-full text-center animate-in fade-in zoom-in-95 duration-200">
        
        {/* Shield Icon Badge */}
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto mb-4 text-amber-600 shadow-xs">
          <ShieldAlert className="w-8 h-8 stroke-[2.2]" />
        </div>

        {/* Access Denied Header */}
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
          Acceso Restringido
        </h2>
        
        <p className="text-slate-600 text-sm mb-4 leading-relaxed">
          Tu rol actual (<strong>{role}</strong>) no cuenta con permisos para acceder a <strong>{tabLabels[tabName] || tabName}</strong>.
        </p>

        <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs text-slate-500 mb-6 flex items-center justify-center gap-2">
          <Lock className="w-4 h-4 text-slate-400 shrink-0" />
          <span>Solicita autorización a un <strong>CEO o Supervisor</strong> para habilitar este módulo.</span>
        </div>

        {/* Action Button */}
        <button
          type="button"
          id="access-denied-back-btn"
          onClick={onNavigateToAllowed}
          className="w-full py-3 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Regresar a Módulo Permitido</span>
        </button>
      </div>
    </div>
  );
};
