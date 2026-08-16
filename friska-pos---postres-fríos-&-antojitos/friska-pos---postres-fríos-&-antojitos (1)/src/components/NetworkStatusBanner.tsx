import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, CheckCircle2, ShieldCheck, X } from 'lucide-react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

export const NetworkStatusBanner: React.FC = () => {
  const { isOnline, wasOffline } = useNetworkStatus();
  const [showRestoredNotice, setShowRestoredNotice] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  useEffect(() => {
    if (isOnline && wasOffline) {
      setShowRestoredNotice(true);
      const timer = setTimeout(() => {
        setShowRestoredNotice(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  // Reset dismissal when offline state changes
  useEffect(() => {
    if (!isOnline) {
      setIsDismissed(false);
    }
  }, [isOnline]);

  if (isOnline && !showRestoredNotice) {
    return null;
  }

  if (isOnline && showRestoredNotice) {
    return (
      <div 
        id="network-restored-banner"
        className="bg-emerald-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-md animate-in slide-in-from-top duration-200 z-40"
      >
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-emerald-200 shrink-0 animate-bounce" />
            <span>
              <strong>Conexión Restablecida:</strong> El sistema se encuentra en línea nuevamente.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowRestoredNotice(false)}
            className="text-emerald-100 hover:text-white p-1 rounded-md transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  if (!isOnline && !isDismissed) {
    return (
      <div 
        id="network-offline-banner"
        className="bg-amber-600 text-white px-4 py-2.5 text-xs font-medium shadow-md flex items-center justify-between z-40 animate-in slide-in-from-top duration-200"
      >
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-amber-700/80 flex items-center justify-center shrink-0">
              <WifiOff className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
            </div>
            <div>
              <span className="font-bold mr-1">Modo Sin Conexión (Offline):</span>
              <span className="text-amber-100">
                Puedes seguir registrando ventas y turnos normalmente. Los datos se guardan de forma segura en este dispositivo.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="inline-flex items-center gap-1 bg-amber-700/60 px-2 py-0.5 rounded text-[11px] font-semibold text-amber-200">
              <ShieldCheck className="w-3 h-3 text-emerald-300" />
              Guardado Local Activo
            </span>
            <button
              type="button"
              id="dismiss-offline-banner-btn"
              onClick={() => setIsDismissed(true)}
              className="text-amber-200 hover:text-white p-1 rounded-md transition cursor-pointer"
              title="Ocultar aviso"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
