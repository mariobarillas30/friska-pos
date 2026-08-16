import React, { useState, useEffect } from 'react';
import { Product, SelectedTopping, Topping } from '../types';
import { X, Plus, Minus, Check, Sparkles, MessageSquare } from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { handleImageError } from '../utils/imageFallback';
import { roundCurrency, formatCurrency } from '../utils/currency';

interface Props {
  product: Product | null;
  onClose: () => void;
  onConfirm: (product: Product, toppings: SelectedTopping[], qty: number, notes: string) => void;
}

export const ProductCustomizerModal: React.FC<Props> = ({ product, onClose, onConfirm }) => {
  const { toppings } = usePOS();
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedToppings, setSelectedToppings] = useState<SelectedTopping[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Global ESC key listener to close modal
  useEffect(() => {
    if (!product) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [product, onClose, isSubmitting]);

  useEffect(() => {
    if (product) {
      setQuantity(1);
      setSelectedToppings([]);
      setNotes('');
      setIsSubmitting(false);
    }
  }, [product]);

  if (!product) return null;

  const toggleTopping = (topping: Topping) => {
    if (isSubmitting) return;
    setSelectedToppings(prev => {
      const exists = prev.some(t => t.id === topping.id);
      if (exists) {
        return prev.filter(t => t.id !== topping.id);
      } else {
        return [...prev, { id: topping.id, name: topping.name, price: roundCurrency(topping.price) }];
      }
    });
  };

  const toppingsTotal = roundCurrency(selectedToppings.reduce((acc, t) => acc + t.price, 0));
  const unitPrice = roundCurrency(product.price + toppingsTotal);
  const totalPrice = roundCurrency(unitPrice * quantity);

  const handleAdd = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      onConfirm(product, selectedToppings, quantity, notes);
      onClose();
    } catch (err) {
      console.error('Error adding item to cart:', err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        id="product-customizer-modal"
        className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header with image */}
        <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent flex flex-col justify-end p-4">
            <div className="flex items-center justify-between text-white">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider bg-orange-500/90 text-white px-2.5 py-0.5 rounded-full inline-block mb-1">
                  {product.category}
                </span>
                <h3 className="text-xl font-bold text-white leading-tight">{product.name}</h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-amber-200 block">Precio Base</span>
                <span className="text-2xl font-black text-white">{formatCurrency(product.price)}</span>
              </div>
            </div>
          </div>
          <button
            id="close-customizer-btn"
            onClick={onClose}
            className="absolute top-3 right-3 bg-slate-900/70 hover:bg-slate-900 text-white rounded-full p-2 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-5">
          <p className="text-sm text-slate-600 leading-relaxed">{product.description}</p>

          {/* Toppings / Agregados */}
          {product.toppingsAllowed && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Toppings & Extras Opcionales
                </label>
                <span className="text-xs text-slate-400">Selecciona los que gustes</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {toppings.map(topping => {
                  const isSelected = selectedToppings.some(t => t.id === topping.id);
                  return (
                    <button
                      key={topping.id}
                      type="button"
                      onClick={() => toggleTopping(topping)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition cursor-pointer text-sm ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50/80 text-orange-950 font-medium shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/60 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center border transition ${
                            isSelected ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="truncate">{topping.name}</span>
                      </div>
                      <span className="text-xs font-semibold text-slate-500 ml-1">
                        +${topping.price.toFixed(2)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Special Notes / Indicaciones */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
              Nota Especial para Preparación
            </label>
            <input
              type="text"
              id="product-customizer-notes"
              value={notes ?? ''}
              onChange={e => setNotes(e.target.value)}
              placeholder="Ej: Sin chile, mucho chamoy, servido en vaso aparte..."
              className="w-full text-sm px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
            />
          </div>
        </div>

        {/* Footer controls */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Quantity Selector */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-xs">
            <button
              type="button"
              id="decrease-qty-btn"
              disabled={quantity <= 1}
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-10 text-center font-bold text-slate-800">{quantity}</span>
            <button
              type="button"
              id="increase-qty-btn"
              onClick={() => setQuantity(q => q + 1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Confirm Button */}
          <button
            type="button"
            id="confirm-add-to-cart-btn"
            disabled={isSubmitting}
            onClick={handleAdd}
            className="w-full sm:w-auto flex-1 flex items-center justify-between bg-orange-600 hover:bg-orange-700 active:bg-orange-800 disabled:bg-slate-400 text-white font-bold px-5 py-3 rounded-xl shadow-md transition cursor-pointer"
          >
            <span>Agregar a la Orden</span>
            <span className="text-lg tracking-tight bg-orange-700/60 px-3 py-0.5 rounded-lg ml-2">
              {formatCurrency(totalPrice)} USD
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
