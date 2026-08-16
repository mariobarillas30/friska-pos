import React, { useEffect } from 'react';
import { Sale } from '../types';
import { usePOS } from '../context/POSContext';
import { 
  X, 
  Printer, 
  CheckCircle, 
  ShoppingBag, 
  UtensilsCrossed, 
  Calendar, 
  User, 
  PlusCircle,
  Share2
} from 'lucide-react';
import { formatCurrency } from '../utils/currency';

interface Props {
  sale: Sale | null;
  onClose: () => void;
  onNewSale: () => void;
}

export const ReceiptModal: React.FC<Props> = ({ sale, onClose, onNewSale }) => {
  const { businessSettings } = usePOS();

  // Global ESC key listener to close receipt modal
  useEffect(() => {
    if (!sale) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sale, onClose]);

  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const lines = [
      `*** ${businessSettings.name} ***`,
      `${businessSettings.slogan}`,
      `Ticket: ${sale.id}`,
      `Fecha: ${new Date(sale.createdAt || sale.timestamp).toLocaleString('es-ES')}`,
      `Cliente: ${sale.customerName || 'Cliente General'}`,
      `Tipo: ${sale.orderType === 'llevar' ? 'Para Llevar' : 'Comer Aquí'}`,
      '--------------------------------',
      ...sale.items.map(
        item => `${item.quantity}x ${item.name} - ${formatCurrency(item.subtotal)}`
      ),
      '--------------------------------',
      `TOTAL: ${formatCurrency(sale.total)} USD`,
      `Método: ${sale.paymentMethod.toUpperCase()}`,
      `Pagado: ${formatCurrency(sale.amountPaid)}`,
      `Cambio: ${formatCurrency(sale.changeGiven)}`,
      '--------------------------------',
      businessSettings.receiptFooter,
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    alert('Ticket copiado al portapapeles');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
      <div 
        id="pos-receipt-modal"
        className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Top Celebration Banner */}
        <div className="bg-emerald-600 text-white p-4 flex items-center justify-between no-print">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-6 h-6 text-emerald-200" />
            <div>
              <h3 className="font-bold text-base leading-none">¡Venta Registrada con Éxito!</h3>
              <p className="text-xs text-emerald-100 mt-0.5">Orden {sale.id}</p>
            </div>
          </div>
          <button
            id="close-receipt-btn"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-emerald-700/50 hover:bg-emerald-800 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Change Banner if Cash */}
        {sale.paymentMethod === 'efectivo' && (
          <div className="bg-amber-50 border-b border-amber-200 p-3.5 flex items-center justify-between no-print">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Cambio / Vuelto</span>
              <div className="text-2xl font-black text-amber-900">{formatCurrency(sale.changeGiven)} USD</div>
            </div>
            <div className="text-right text-xs text-amber-700 font-medium">
              <span>Recibido: {formatCurrency(sale.amountPaid)}</span>
              <br />
              <span>Total: {formatCurrency(sale.total)}</span>
            </div>
          </div>
        )}

        {/* Thermal Receipt Body */}
        <div className="p-5 overflow-y-auto flex-1 font-mono text-xs text-slate-800 space-y-4 bg-slate-50/50 receipt-printable-content">
          
          {/* Header info */}
          <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-300">
            <h2 className="font-sans font-black text-lg text-slate-900">{businessSettings.name}</h2>
            <p className="text-slate-600">{businessSettings.slogan}</p>
            <p className="text-slate-500">{businessSettings.address}</p>
            <p className="text-slate-500">Tel: {businessSettings.phone}</p>
          </div>

          {/* Ticket metadata */}
          <div className="space-y-1 pb-3 border-b border-dashed border-slate-300 text-slate-600">
            <div className="flex justify-between">
              <span className="font-semibold text-slate-800">TICKET: {sale.id}</span>
              <span className="flex items-center gap-1 font-semibold text-slate-800 uppercase">
                {sale.orderType === 'llevar' ? (
                  <>
                    <ShoppingBag className="w-3 h-3 text-orange-600" /> Para Llevar
                  </>
                ) : (
                  <>
                    <UtensilsCrossed className="w-3 h-3 text-orange-600" /> Comer Aquí
                  </>
                )}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                {new Date(sale.createdAt || sale.timestamp).toLocaleString('es-ES', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3 text-slate-400" />
                Cliente: {sale.customerName || 'Consumidor Final'}
              </span>
            </div>
            <div>
              <span>Atendido por: {sale.cashierName}</span>
            </div>
          </div>

          {/* Items list */}
          <div className="space-y-2 pb-3 border-b border-dashed border-slate-300">
            <div className="grid grid-cols-12 font-bold text-slate-500 uppercase pb-1 border-b border-slate-200">
              <span className="col-span-2">Cant</span>
              <span className="col-span-7">Descripción</span>
              <span className="col-span-3 text-right">Total</span>
            </div>

            {sale.items.map((item, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="grid grid-cols-12 text-slate-800 font-medium">
                  <span className="col-span-2 font-bold">{item.quantity}x</span>
                  <span className="col-span-7">{item.name}</span>
                  <span className="col-span-3 text-right font-bold">{formatCurrency(item.subtotal)}</span>
                </div>
                {item.selectedToppings.length > 0 && (
                  <div className="text-slate-500 pl-6 text-[11px]">
                    + {item.selectedToppings.map(t => t.name).join(', ')}
                  </div>
                )}
                {item.notes && (
                  <div className="text-slate-500 pl-6 text-[11px] italic">
                    Nota: {item.notes}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Financial calculations */}
          <div className="space-y-1.5 pb-3 border-b border-dashed border-slate-300">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span>{formatCurrency(sale.subtotal)}</span>
            </div>
            {sale.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Descuento:</span>
                <span>-{formatCurrency(sale.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-sans font-black text-slate-900 pt-1">
              <span>TOTAL:</span>
              <span>{formatCurrency(sale.total)} USD</span>
            </div>
          </div>

          {/* Payment method summary */}
          <div className="space-y-1 text-slate-600">
            <div className="flex justify-between">
              <span className="capitalize">Método de Pago:</span>
              <span className="font-bold uppercase text-slate-800">{sale.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span>Monto Recibido:</span>
              <span>{formatCurrency(sale.amountPaid)}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-900">
              <span>Vuelto / Cambio:</span>
              <span>{formatCurrency(sale.changeGiven)}</span>
            </div>
          </div>

          {/* Footer message */}
          <div className="text-center pt-2 text-slate-500 text-[11px]">
            <p>{businessSettings.receiptFooter}</p>
            <p className="mt-1 text-[10px] text-slate-400">--- Friska POS Cloud v1.0 ---</p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 no-print">
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="print-receipt-btn"
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-300 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 shadow-2xs transition cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              Imprimir
            </button>
            <button
              type="button"
              id="share-receipt-btn"
              onClick={handleCopyText}
              className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-300 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 shadow-2xs transition cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-slate-600" />
              Copiar
            </button>
          </div>

          <button
            type="button"
            id="start-new-sale-btn"
            onClick={() => {
              onNewSale();
              onClose();
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nueva Venta</span>
          </button>
        </div>
      </div>
    </div>
  );
};
