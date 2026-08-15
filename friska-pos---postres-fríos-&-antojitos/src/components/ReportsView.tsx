import React, { useState } from 'react';
import { usePOS } from '../context/POSContext';
import { 
  BarChart3, 
  Send, 
  DollarSign, 
  Banknote, 
  CreditCard, 
  QrCode, 
  Calendar, 
  Clock, 
  RotateCcw, 
  CheckCircle2, 
  AlertOctagon, 
  TrendingUp, 
  ShoppingBag, 
  Printer, 
  Copy, 
  Phone, 
  Sparkles,
  Lock,
  Unlock
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const {
    metrics,
    currentShift,
    businessSettings,
    generateWhatsAppSummary,
    openShift,
    closeShift,
    resetShiftSales,
    updateBusinessSettings,
  } = usePOS();

  const [customPhone, setCustomPhone] = useState<string>(businessSettings?.phone ?? '');
  const [initialCashInput, setInitialCashInput] = useState<string>(
    currentShift?.initialCash !== undefined && currentShift?.initialCash !== null
      ? currentShift.initialCash.toString()
      : '0.00'
  );
  const [isCashierModalOpen, setIsCashierModalOpen] = useState<boolean>(false);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  // Sync state when props/context values change
  React.useEffect(() => {
    if (businessSettings?.phone) {
      setCustomPhone(businessSettings.phone);
    }
  }, [businessSettings?.phone]);

  React.useEffect(() => {
    if (currentShift?.initialCash !== undefined) {
      setInitialCashInput(currentShift.initialCash.toString());
    }
  }, [currentShift?.initialCash]);

  // Global ESC key listener to close cashier modal
  React.useEffect(() => {
    if (!isCashierModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCashierModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCashierModalOpen]);

  const { text: whatsAppText, url: whatsAppUrl } = generateWhatsAppSummary(customPhone);

  const handleSendWhatsApp = () => {
    window.open(whatsAppUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopySummary = () => {
    navigator.clipboard.writeText(whatsAppText);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  const handleUpdateShiftInitial = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(initialCashInput);
    openShift(isNaN(val) ? 0 : val);
    setIsCashierModalOpen(false);
  };

  const handlePrintReport = () => {
    window.print();
  };

  const shiftDuration = Math.max(
    0.1,
    Math.round(((Date.now() - currentShift.openedAt) / (1000 * 60 * 60)) * 10) / 10
  );

  return (
    <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-slate-100">
      <div className="w-full max-w-[1920px] mx-auto space-y-6">
        
        {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">Cierre de Caja & Reportes</h1>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                currentShift.status === 'open' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
              }`}>
                {currentShift.status === 'open' ? '🟢 Turno Activo' : '⚪ Turno Cerrado'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Métricas dinámicas en tiempo real, desglose de pagos y envío instantáneo a WhatsApp
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            type="button"
            id="print-summary-report-btn"
            onClick={handlePrintReport}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Imprimir
          </button>

          <button
            type="button"
            id="open-cash-drawer-settings-btn"
            onClick={() => setIsCashierModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            Fondo Inicial (${metrics.initialCash.toFixed(2)})
          </button>

          <button
            type="button"
            id="start-new-shift-btn"
            onClick={() => {
              if (window.confirm('¿Deseas reiniciar el turno actual a $0.00 para empezar un nuevo turno de ventas?')) {
                resetShiftSales();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Nuevo Turno ($0.00)
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Net Sales */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Ventas Netas Totales</span>
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            ${metrics.netSales.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>{metrics.activeSalesCount} órdenes completadas</span>
            <span className="font-semibold text-emerald-600">Activo</span>
          </div>
        </div>

        {/* Expected Cash in Drawer */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Efectivo en Caja</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-700 tracking-tight">
            ${metrics.expectedCashInDrawer.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Fondo (${metrics.initialCash.toFixed(2)}) + Ventas ($ {metrics.cashSales.toFixed(2)})
          </div>
        </div>

        {/* Average Ticket */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Ticket Promedio</span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            ${metrics.averageTicket.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {metrics.itemsSoldTotal} unidades vendidas
          </div>
        </div>

        {/* Canceled Sales */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600">Ventas Anuladas</span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-rose-600 tracking-tight">
            -${metrics.canceledAmount.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>{metrics.canceledSalesCount} ventas canceladas</span>
            <span className="text-[10px] text-rose-500 font-bold">Descontado</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Payment Breakdown + WhatsApp Sender */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT (7 cols): Payment Breakdown & Top Selling Items */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Payment Method Breakdown Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-orange-600" />
              Desglose por Métodos de Pago
            </h3>

            <div className="space-y-3">
              {/* Cash */}
              <div className="p-3.5 bg-emerald-50/60 border border-emerald-100 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 text-sm block">Efectivo</span>
                    <span className="text-xs text-slate-500">
                      {metrics.netSales > 0 ? Math.round((metrics.cashSales / metrics.netSales) * 100) : 0}% de las ventas
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-emerald-800">${metrics.cashSales.toFixed(2)}</span>
                  <span className="text-[10px] text-slate-500 block">USD</span>
                </div>
              </div>

              {/* Card */}
              <div className="p-3.5 bg-blue-50/60 border border-blue-100 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 text-sm block">Tarjeta de Débito / Crédito</span>
                    <span className="text-xs text-slate-500">
                      {metrics.netSales > 0 ? Math.round((metrics.cardSales / metrics.netSales) * 100) : 0}% de las ventas
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-blue-800">${metrics.cardSales.toFixed(2)}</span>
                  <span className="text-[10px] text-slate-500 block">USD</span>
                </div>
              </div>

              {/* Transfer / QR */}
              <div className="p-3.5 bg-purple-50/60 border border-purple-100 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 text-sm block">Transferencia / QR</span>
                    <span className="text-xs text-slate-500">
                      {metrics.netSales > 0 ? Math.round((metrics.transferSales / metrics.netSales) * 100) : 0}% de las ventas
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-purple-800">${metrics.transferSales.toFixed(2)}</span>
                  <span className="text-[10px] text-slate-500 block">USD</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Products Table */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-orange-600" />
              Productos Más Vendidos en este Turno
            </h3>

            {metrics.topProducts.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                Aún no hay productos registrados en el turno activo.
              </div>
            ) : (
              <div className="space-y-2">
                {metrics.topProducts.map((prod, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-md bg-orange-100 text-orange-800 font-bold flex items-center justify-center text-[11px]">
                        #{idx + 1}
                      </span>
                      <span className="font-bold text-slate-800">{prod.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-slate-600">{prod.quantity} unidades</span>
                      <span className="text-slate-400 ml-2 font-bold">(${prod.revenue.toFixed(2)})</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT (5 cols): WhatsApp Direct Export Card (STAR FEATURE) */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-gradient-to-b from-white to-emerald-50/40 rounded-2xl border-2 border-emerald-500/40 p-5 shadow-md space-y-4">
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base leading-tight">
                  Enviar Resumen por WhatsApp
                </h3>
                <p className="text-xs text-slate-500">
                  Genera el reporte formateado para el dueño o administrador
                </p>
              </div>
            </div>

            {/* Custom WhatsApp Phone input */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                Número de WhatsApp (con código de país)
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="whatsapp-phone-input"
                  value={customPhone ?? ''}
                  onChange={e => {
                    setCustomPhone(e.target.value);
                    updateBusinessSettings({ phone: e.target.value });
                  }}
                  placeholder="Ej: 50371234567 o 52155..."
                  className="w-full text-xs font-mono px-3.5 py-2.5 bg-white border border-emerald-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-800"
                />
              </div>
            </div>

            {/* Formatted Text Preview */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Vista Previa del Mensaje
                </span>
                <button
                  type="button"
                  id="copy-whatsapp-text-btn"
                  onClick={handleCopySummary}
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedNotification ? '¡Copiado!' : 'Copiar Texto'}
                </button>
              </div>
              
              <div className="bg-slate-900 text-emerald-300 p-3.5 rounded-xl font-mono text-[11px] h-64 overflow-y-auto whitespace-pre-wrap leading-relaxed shadow-inner border border-slate-800 select-all">
                {whatsAppText}
              </div>
            </div>

            {/* Send Button */}
            <button
              type="button"
              id="send-whatsapp-direct-btn"
              onClick={handleSendWhatsApp}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-sm rounded-xl shadow-md transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>ENVIAR RESUMEN POR WHATSAPP</span>
            </button>
          </div>
        </div>
      </div>

      {/* CASH DRAWER INITIAL AMOUNT MODAL */}
      {isCashierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div 
            id="cash-drawer-settings-modal"
            className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center gap-3 text-slate-800">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base">Fondo Inicial de Caja</h3>
                <p className="text-xs text-slate-500">Monto base en efectivo con que abre el turno</p>
              </div>
            </div>

            <form onSubmit={handleUpdateShiftInitial} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
                  Monto en Efectivo (USD $)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    id="shift-initial-cash-input"
                    value={initialCashInput ?? ''}
                    onChange={e => setInitialCashInput(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 text-base font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  id="cancel-initial-cash-btn"
                  onClick={() => setIsCashierModalOpen(false)}
                  className="px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  id="save-initial-cash-btn"
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  Guardar Fondo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
