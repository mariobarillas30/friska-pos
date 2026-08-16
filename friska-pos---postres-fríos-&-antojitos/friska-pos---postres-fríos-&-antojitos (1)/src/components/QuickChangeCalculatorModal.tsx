import React, { useState, useEffect } from 'react';
import { X, Calculator, DollarSign, RotateCcw, ArrowRight } from 'lucide-react';
import { roundCurrency, formatCurrency } from '../utils/currency';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickChangeCalculatorModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [totalStr, setTotalStr] = useState<string>('');
  const [receivedStr, setReceivedStr] = useState<string>('');

  // Global ESC key listener to close calculator modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const total = roundCurrency(parseFloat(totalStr) || 0);
  const received = roundCurrency(parseFloat(receivedStr) || 0);
  const change = Math.max(0, roundCurrency(received - total));
  const remaining = Math.max(0, roundCurrency(total - received));

  const handleReset = () => {
    setTotalStr('');
    setReceivedStr('');
  };

  const handleQuickReceived = (val: number) => {
    setReceivedStr(val.toString());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div 
        id="quick-change-calculator-modal"
        className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="bg-emerald-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Calculadora de Vueltos</h3>
              <p className="text-[11px] text-emerald-100">Cálculo rápido de cambio en efectivo</p>
            </div>
          </div>
          <button
            id="close-quick-calc-btn"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Inputs */}
        <div className="p-4 sm:p-5 space-y-4 text-slate-800">
          
          {/* Total to Charge */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
              Total de la Venta (USD $)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                id="quick-calc-total-input"
                value={totalStr ?? ''}
                onChange={e => setTotalStr(e.target.value)}
                placeholder="0.00"
                className="w-full text-lg font-bold pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Amount Received */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
              Efectivo Recibido (USD $)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                id="quick-calc-received-input"
                value={receivedStr ?? ''}
                onChange={e => setReceivedStr(e.target.value)}
                placeholder="0.00"
                className="w-full text-lg font-bold pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Quick Bill shortcuts */}
            <div className="flex gap-1.5 pt-1.5">
              {[1, 2, 5, 10, 20].map(bill => (
                <button
                  key={bill}
                  type="button"
                  onClick={() => handleQuickReceived(bill)}
                  className="flex-1 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 rounded-lg text-xs font-bold text-slate-700 transition border border-slate-200 cursor-pointer"
                >
                  ${bill}
                </button>
              ))}
            </div>
          </div>

          {/* Result Highlight Box */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              {received >= total ? 'Cambio / Vuelto a entregar' : 'Dinero Faltante'}
            </span>
            <div className="text-3xl font-black text-emerald-900">
              {received >= total ? (
                <span>{formatCurrency(change)} USD</span>
              ) : (
                <span className="text-rose-600">-{formatCurrency(remaining)} USD</span>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Limpiar
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
