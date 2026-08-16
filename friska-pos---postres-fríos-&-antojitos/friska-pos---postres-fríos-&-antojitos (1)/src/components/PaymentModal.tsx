import React, { useState, useEffect } from 'react';
import { PaymentMethod, OrderType, Sale } from '../types';
import { usePOS } from '../context/POSContext';
import { 
  X, 
  Banknote, 
  CreditCard, 
  QrCode, 
  DollarSign, 
  User, 
  ShoppingBag, 
  UtensilsCrossed, 
  CheckCircle2, 
  AlertCircle,
  Calculator,
  Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { roundCurrency, formatCurrency } from '../utils/currency';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (sale: Sale) => void;
}

export const PaymentModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const { cartTotal, cartItemCount, completeSale } = usePOS();
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');
  const [orderType, setOrderType] = useState<OrderType>('llevar');
  const [customerName, setCustomerName] = useState<string>('');
  const [amountPaidStr, setAmountPaidStr] = useState<string>('');
  const [discount, setDiscount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Global ESC key listener to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isSubmitting]);

  // Sync default cash paid to cartTotal
  useEffect(() => {
    if (isOpen) {
      setPaymentMethod('efectivo');
      setAmountPaidStr('');
      setDiscount(0);
      setCustomerName('');
      setIsSubmitting(false);
    }
  }, [isOpen, cartTotal]);

  if (!isOpen) return null;

  const finalTotal = Math.max(0, roundCurrency(cartTotal - discount));
  const amountPaidNum = amountPaidStr === '' ? 0 : roundCurrency(parseFloat(amountPaidStr) || 0);

  // Change computation
  const changeGiven = paymentMethod === 'efectivo' 
    ? Math.max(0, roundCurrency(amountPaidNum - finalTotal))
    : 0;

  const isCashInsufficient = paymentMethod === 'efectivo' && amountPaidNum < finalTotal;
  const isReadyToPay = (paymentMethod !== 'efectivo' || (paymentMethod === 'efectivo' && amountPaidNum >= finalTotal)) && !isSubmitting;

  const handleQuickCash = (value: number) => {
    if (isSubmitting) return;
    setAmountPaidStr(value.toString());
  };

  const handleExactCash = () => {
    if (isSubmitting) return;
    setAmountPaidStr(finalTotal.toFixed(2));
  };

  const handleFinalize = () => {
    if (!isReadyToPay || isSubmitting) return;

    // Immediately set isSubmitting to prevent accidental double click sale duplicate
    setIsSubmitting(true);

    try {
      const actualAmountPaid = paymentMethod === 'efectivo' 
        ? (amountPaidNum || finalTotal)
        : finalTotal;

      const sale = completeSale({
        paymentMethod,
        amountPaid: actualAmountPaid,
        changeGiven,
        customerName,
        orderType,
        discount,
      });

      // Confetti effect
      try {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#f97316', '#f59e0b', '#10b981', '#06b6d4'],
        });
      } catch (e) {
        console.log('Confetti error', e);
      }

      onSuccess(sale);
    } catch (err) {
      console.error('Error finalizing sale:', err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
      <div 
        id="pos-payment-modal"
        className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[95vh] animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Cobrar Orden</h2>
              <p className="text-xs text-orange-100 font-medium">
                {cartItemCount} {cartItemCount === 1 ? 'producto' : 'productos'} en la orden
              </p>
            </div>
          </div>
          <button
            id="close-payment-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 text-slate-800">
          
          {/* Order Total Highlight */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-500 block">Total a Pagar</span>
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                ${finalTotal.toFixed(2)} <span className="text-sm font-normal text-slate-500">USD</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                id="order-type-llevar-btn"
                onClick={() => setOrderType('llevar')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                  orderType === 'llevar'
                    ? 'bg-orange-50 border-orange-300 text-orange-700 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                Para Llevar
              </button>
              <button
                type="button"
                id="order-type-aqui-btn"
                onClick={() => setOrderType('aqui')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                  orderType === 'aqui'
                    ? 'bg-orange-50 border-orange-300 text-orange-700 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <UtensilsCrossed className="w-3.5 h-3.5" />
                Comer Aquí
              </button>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2">
              Método de Pago
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                id="pay-method-efectivo"
                onClick={() => setPaymentMethod('efectivo')}
                className={`p-3.5 rounded-xl border text-center transition flex flex-col items-center gap-1.5 cursor-pointer ${
                  paymentMethod === 'efectivo'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold shadow-xs ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                }`}
              >
                <Banknote className={`w-5 h-5 ${paymentMethod === 'efectivo' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span className="text-xs font-medium">Efectivo</span>
              </button>

              <button
                type="button"
                id="pay-method-tarjeta"
                onClick={() => setPaymentMethod('tarjeta')}
                className={`p-3.5 rounded-xl border text-center transition flex flex-col items-center gap-1.5 cursor-pointer ${
                  paymentMethod === 'tarjeta'
                    ? 'border-blue-500 bg-blue-50 text-blue-950 font-bold shadow-xs ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                }`}
              >
                <CreditCard className={`w-5 h-5 ${paymentMethod === 'tarjeta' ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className="text-xs font-medium">Tarjeta</span>
              </button>

              <button
                type="button"
                id="pay-method-transferencia"
                onClick={() => setPaymentMethod('transferencia')}
                className={`p-3.5 rounded-xl border text-center transition flex flex-col items-center gap-1.5 cursor-pointer ${
                  paymentMethod === 'transferencia'
                    ? 'border-purple-500 bg-purple-50 text-purple-950 font-bold shadow-xs ring-2 ring-purple-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                }`}
              >
                <QrCode className={`w-5 h-5 ${paymentMethod === 'transferencia' ? 'text-purple-600' : 'text-slate-400'}`} />
                <span className="text-xs font-medium">Transferencia / QR</span>
              </button>
            </div>
          </div>

          {/* Cash Calculator (When Efectivo selected) */}
          {paymentMethod === 'efectivo' && (
            <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-4 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-emerald-600" />
                  Calculadora de Efectivo y Vuelto
                </span>
                <button
                  type="button"
                  id="quick-exact-cash-btn"
                  onClick={handleExactCash}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-emerald-300 shadow-2xs transition cursor-pointer"
                >
                  Monto Exacto (${finalTotal.toFixed(2)})
                </button>
              </div>

              {/* Amount input & Quick bills */}
              <div className="space-y-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <span className="text-lg font-bold text-slate-400">$</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    id="cash-amount-received-input"
                    value={amountPaidStr ?? ''}
                    onChange={e => setAmountPaidStr(e.target.value)}
                    placeholder={finalTotal.toFixed(2)}
                    className="w-full text-xl font-bold pl-8 pr-4 py-2.5 bg-white border border-emerald-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 shadow-2xs"
                  />
                </div>

                {/* Quick denomination presets */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {[1, 2, 5, 10, 20].map(bill => (
                    <button
                      key={bill}
                      type="button"
                      onClick={() => handleQuickCash(bill)}
                      className={`flex-1 py-1.5 px-2.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
                        amountPaidNum === bill
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white border-emerald-200 text-emerald-800 hover:bg-emerald-100/50'
                      }`}
                    >
                      ${bill}.00
                    </button>
                  ))}
                </div>
              </div>

              {/* Change calculation result card */}
              <div className="bg-white rounded-xl p-3.5 border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                    {isCashInsufficient ? 'Faltante por pagar' : 'Cambio / Vuelto a Entregar'}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {isCashInsufficient ? (
                      <span className="text-xl font-black text-rose-600">
                        -${(finalTotal - amountPaidNum).toFixed(2)} USD
                      </span>
                    ) : (
                      <span className="text-2xl font-black text-emerald-600">
                        ${changeGiven.toFixed(2)} USD
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right text-xs text-slate-500">
                  <span>Recibido: <strong>${amountPaidNum > 0 ? amountPaidNum.toFixed(2) : '0.00'}</strong></span>
                  <br />
                  <span>Total: <strong>${finalTotal.toFixed(2)}</strong></span>
                </div>
              </div>

              {isCashInsufficient && (
                <p className="text-xs text-rose-600 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  El monto recibido es menor al total de la orden.
                </p>
              )}
            </div>
          )}

          {/* Customer Name and Optional Notes */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5 mb-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Nombre del Cliente (Opcional)
            </label>
            <input
              type="text"
              id="payment-customer-name-input"
              value={customerName ?? ''}
              onChange={e => setCustomerName(e.target.value)}
              placeholder="Ej: Mario Barillas / Mesa 3..."
              className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            id="cancel-payment-btn"
            disabled={isSubmitting}
            onClick={onClose}
            className="px-4 py-3 border border-slate-300 hover:bg-slate-100 disabled:opacity-50 text-slate-700 font-bold rounded-xl text-sm transition cursor-pointer"
          >
            Regresar
          </button>

          <button
            type="button"
            id="finalize-payment-btn"
            disabled={!isReadyToPay || isSubmitting}
            onClick={handleFinalize}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-bold text-sm shadow-md transition cursor-pointer ${
              isReadyToPay && !isSubmitting
                ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-white" />
                <span>Procesando Venta...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Confirmar Venta (${finalTotal.toFixed(2)} USD)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
