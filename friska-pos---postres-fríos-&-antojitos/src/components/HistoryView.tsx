import React, { useState } from 'react';
import { usePOS } from '../context/POSContext';
import { Sale, SaleStatus, PaymentMethod } from '../types';
import { 
  Receipt, 
  Search, 
  Filter, 
  Ban, 
  Eye, 
  Printer, 
  CheckCircle2, 
  XCircle, 
  DollarSign, 
  ShoppingBag, 
  UtensilsCrossed, 
  Calendar, 
  AlertTriangle,
  Banknote,
  CreditCard,
  QrCode,
  ArrowUpDown
} from 'lucide-react';
import { ReceiptModal } from './ReceiptModal';

export const HistoryView: React.FC = () => {
  const { sales, cancelSale, currentShift } = usePOS();
  
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'todos' | SaleStatus>('todos');
  const [methodFilter, setMethodFilter] = useState<'todos' | PaymentMethod>('todos');
  
  // Selected sale for receipt viewing
  const [selectedSaleForReceipt, setSelectedSaleForReceipt] = useState<Sale | null>(null);
  
  // Sale to cancel modal state
  const [saleToCancel, setSaleToCancel] = useState<Sale | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('Error de digitación / Solicitud de cliente');

  // Filtering sales
  const filteredSales = sales.filter(sale => {
    const matchesSearch =
      sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sale.customerName && sale.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      sale.items.some(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'todos' || sale.status === statusFilter;
    const matchesMethod = methodFilter === 'todos' || sale.paymentMethod === methodFilter;

    return matchesSearch && matchesStatus && matchesMethod;
  });

  const handleConfirmCancel = () => {
    if (!saleToCancel) return;
    cancelSale(saleToCancel.id, cancelReason);
    setSaleToCancel(null);
    setCancelReason('Error de digitación / Solicitud de cliente');
  };

  const getMethodBadge = (method: PaymentMethod) => {
    switch (method) {
      case 'efectivo':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            <Banknote className="w-3 h-3" /> Efectivo
          </span>
        );
      case 'tarjeta':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
            <CreditCard className="w-3 h-3" /> Tarjeta
          </span>
        );
      case 'transferencia':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
            <QrCode className="w-3 h-3" /> QR / Transf.
          </span>
        );
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-slate-100">
      <div className="w-full max-w-[1920px] mx-auto space-y-6">
        
        {/* Header card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-orange-100 text-orange-700 rounded-xl">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Historial de Ventas & Anulaciones</h1>
            <p className="text-xs text-slate-500">
              Auditoría completa de transacciones con anulación directa y recálculo automático de caja
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>Turno ID: <strong>{currentShift.id.slice(0, 14)}</strong></span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="history-search-input"
              value={searchTerm ?? ''}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por ticket, cliente o producto..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition text-slate-800"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              id="history-status-filter"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="w-full text-sm font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition cursor-pointer"
            >
              <option value="todos">Todos los Estados (Completadas y Canceladas)</option>
              <option value="completada">Solo Completadas (Activas)</option>
              <option value="cancelada">Solo Canceladas / Anuladas</option>
            </select>
          </div>

          {/* Payment Method Filter */}
          <div>
            <select
              id="history-method-filter"
              value={methodFilter}
              onChange={e => setMethodFilter(e.target.value as any)}
              className="w-full text-sm font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition cursor-pointer"
            >
              <option value="todos">Todos los Métodos de Pago</option>
              <option value="efectivo">Solo Efectivo</option>
              <option value="tarjeta">Solo Tarjeta</option>
              <option value="transferencia">Solo Transferencia / QR</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sales Table / List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredSales.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700 text-base">No hay ventas registradas</h3>
            <p className="text-xs text-slate-400 mt-1">
              Las ventas que realices en la pestaña POS aparecerán listadas aquí
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Ticket</th>
                  <th className="py-3.5 px-4">Hora & Fecha</th>
                  <th className="py-3.5 px-4">Cliente / Tipo</th>
                  <th className="py-3.5 px-4">Productos</th>
                  <th className="py-3.5 px-4">Método</th>
                  <th className="py-3.5 px-4">Total</th>
                  <th className="py-3.5 px-4 text-center">Estado</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSales.map(sale => {
                  const isCanceled = sale.status === 'cancelada';
                  return (
                    <tr
                      key={sale.id}
                      id={`sale-row-${sale.id}`}
                      className={`hover:bg-slate-50/80 transition ${
                        isCanceled ? 'bg-rose-50/40 text-slate-400' : ''
                      }`}
                    >
                      {/* Ticket ID */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {sale.id}
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 text-slate-600">
                        <div>
                          {new Date(sale.timestamp).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(sale.timestamp).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                          })}
                        </div>
                      </td>

                      {/* Customer / Order Type */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">
                          {sale.customerName || 'Cliente General'}
                        </div>
                        <div className="text-[10px] flex items-center gap-1 text-slate-500 capitalize">
                          {sale.orderType === 'llevar' ? (
                            <>
                              <ShoppingBag className="w-3 h-3 text-orange-500" /> Para Llevar
                            </>
                          ) : (
                            <>
                              <UtensilsCrossed className="w-3 h-3 text-orange-500" /> Comer Aquí
                            </>
                          )}
                        </div>
                      </td>

                      {/* Items count & summary */}
                      <td className="py-3 px-4 max-w-[200px]">
                        <div className="font-medium text-slate-800 truncate">
                          {sale.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {sale.items.reduce((acc, i) => acc + i.quantity, 0)} unidades
                        </div>
                      </td>

                      {/* Payment Method */}
                      <td className="py-3 px-4">
                        {getMethodBadge(sale.paymentMethod)}
                      </td>

                      {/* Total */}
                      <td className="py-3 px-4">
                        <span className={`font-black text-sm ${isCanceled ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                          ${sale.total.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-400 block">USD</span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        {isCanceled ? (
                          <div className="inline-flex flex-col items-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              <XCircle className="w-3 h-3" /> Cancelado
                            </span>
                            {sale.cancelReason && (
                              <span className="text-[9px] text-rose-500 mt-0.5 max-w-[120px] truncate" title={sale.cancelReason}>
                                {sale.cancelReason}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Completada
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Receipt */}
                          <button
                            type="button"
                            id={`view-receipt-btn-${sale.id}`}
                            onClick={() => setSelectedSaleForReceipt(sale)}
                            className="p-1.5 text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition cursor-pointer"
                            title="Ver ticket de venta"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Anular Venta Button */}
                          {!isCanceled && (
                            <button
                              type="button"
                              id={`cancel-sale-btn-${sale.id}`}
                              onClick={() => setSaleToCancel(sale)}
                              className="px-2 py-1 text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 hover:border-rose-600 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 shadow-2xs"
                              title="Anular venta y descontar de caja"
                            >
                              <Ban className="w-3 h-3" />
                              <span>Anular</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CANCEL SALE CONFIRMATION MODAL */}
      {saleToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div 
            id="cancel-sale-confirmation-modal"
            className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150 text-slate-800"
          >
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 leading-tight">¿Anular Venta {saleToCancel.id}?</h3>
                <p className="text-xs text-rose-600 font-semibold">Esta acción descontará el monto de los reportes</p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Monto a Descontar:</span>
                <strong className="text-slate-900 text-sm font-black">${saleToCancel.total.toFixed(2)} USD</strong>
              </div>
              <div className="flex justify-between">
                <span>Método de Pago:</span>
                <strong className="capitalize text-slate-800">{saleToCancel.paymentMethod}</strong>
              </div>
              <div className="flex justify-between">
                <span>Cliente:</span>
                <span>{saleToCancel.customerName || 'Cliente General'}</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
                Motivo de Anulación
              </label>
              <input
                type="text"
                id="cancel-reason-input"
                value={cancelReason ?? ''}
                onChange={e => setCancelReason(e.target.value)}
                placeholder="Ej: Pedido cancelado por el cliente / Cobro erróneo..."
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                id="abort-cancel-sale-btn"
                onClick={() => setSaleToCancel(null)}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                id="confirm-cancel-sale-btn"
                onClick={handleConfirmCancel}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Ban className="w-3.5 h-3.5" />
                Confirmar Anulación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Viewer Modal */}
      <ReceiptModal
        sale={selectedSaleForReceipt}
        onClose={() => setSelectedSaleForReceipt(null)}
        onNewSale={() => setSelectedSaleForReceipt(null)}
      />
      </div>
    </div>
  );
};
