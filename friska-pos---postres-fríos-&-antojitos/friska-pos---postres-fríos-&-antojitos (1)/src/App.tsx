import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth, NavTab } from './context/AuthContext';
import { POSProvider } from './context/POSContext';
import { Navbar } from './components/Navbar';
import { LoginView } from './components/LoginView';
import { AccessDeniedView } from './components/AccessDeniedView';
import { POSView } from './components/POSView';
import { KitchenView } from './components/KitchenView';
import { MenuView } from './components/MenuView';
import { HistoryView } from './components/HistoryView';
import { ReportsView } from './components/ReportsView';
import { QuickChangeCalculatorModal } from './components/QuickChangeCalculatorModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { NetworkStatusBanner } from './components/NetworkStatusBanner';
import { IceCream, Loader2 } from 'lucide-react';

function POSApp() {
  const { user, loading, hasPermission, role } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('pos');
  const [isQuickCalcOpen, setIsQuickCalcOpen] = useState<boolean>(false);

  // If role changes or user logs in, ensure the initial tab is authorized
  useEffect(() => {
    if (user) {
      if (role === 'Cocinero') {
        setActiveTab('kitchen');
      } else if (!hasPermission(activeTab)) {
        setActiveTab('pos');
      }
    }
  }, [user, role]);

  // Loading Splash Screen while Firebase Auth initializes
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 select-none">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 p-0.5 shadow-xl mb-4 flex items-center justify-center animate-pulse">
          <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-orange-400">
            <IceCream className="w-8 h-8 stroke-[2.2]" />
          </div>
        </div>
        <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
          <span>Friska POS</span>
        </h1>
        <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
          <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
          <span>Iniciando sesión segura con Firebase...</span>
        </div>
      </div>
    );
  }

  // If user is not authenticated, strictly show the Login Screen
  if (!user) {
    return <LoginView />;
  }

  // Check RBAC permission for current activeTab
  const isAuthorized = hasPermission(activeTab);

  const fallbackAllowedTab = hasPermission('pos') ? 'pos' : 'kitchen';

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-slate-900 selection:bg-orange-500 selection:text-white">
      {/* Top App Header */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenCalculator={() => setIsQuickCalcOpen(true)}
      />

      {/* Network Status Offline/Online Notification Banner */}
      <NetworkStatusBanner />

      {/* Main View Router with Isolated Error Boundaries & RBAC Enforcement */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {!isAuthorized ? (
          <AccessDeniedView 
            tabName={activeTab} 
            onNavigateToAllowed={() => setActiveTab(fallbackAllowedTab)} 
          />
        ) : (
          <>
            {activeTab === 'pos' && (
              <ErrorBoundary moduleName="Punto de Venta (Caja)">
                <POSView onOpenQuickCalculator={() => setIsQuickCalcOpen(true)} />
              </ErrorBoundary>
            )}

            {activeTab === 'kitchen' && (
              <ErrorBoundary moduleName="Pantalla de Cocina / KDS">
                <KitchenView />
              </ErrorBoundary>
            )}

            {activeTab === 'menu' && (
              <ErrorBoundary moduleName="Catálogo de Productos y Menú">
                <MenuView />
              </ErrorBoundary>
            )}

            {activeTab === 'history' && (
              <ErrorBoundary moduleName="Historial de Ventas y Tickets">
                <HistoryView />
              </ErrorBoundary>
            )}

            {activeTab === 'reports' && (
              <ErrorBoundary moduleName="Cierre de Caja y Reportes">
                <ReportsView />
              </ErrorBoundary>
            )}
          </>
        )}
      </main>

      {/* Standalone Quick Change Calculator Modal */}
      <QuickChangeCalculatorModal
        isOpen={isQuickCalcOpen}
        onClose={() => setIsQuickCalcOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary moduleName="Sistema Friska POS">
      <AuthProvider>
        <POSProvider>
          <POSApp />
        </POSProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
