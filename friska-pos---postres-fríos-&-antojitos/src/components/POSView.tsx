import React, { useState } from 'react';
import { usePOS } from '../context/POSContext';
import { Product, SelectedTopping, Sale } from '../types';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingBag, 
  Sparkles, 
  DollarSign, 
  ArrowRight,
  SlidersHorizontal,
  Layers,
  UtensilsCrossed
} from 'lucide-react';
import { ProductCustomizerModal } from './ProductCustomizerModal';
import { PaymentModal } from './PaymentModal';
import { ReceiptModal } from './ReceiptModal';
import { handleImageError } from '../utils/imageFallback';
import { formatCurrency } from '../utils/currency';

interface Props {
  onOpenQuickCalculator: () => void;
}

export const POSView: React.FC<Props> = ({ onOpenQuickCalculator }) => {
  const {
    products,
    categories,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    cart,
    cartTotal,
    cartItemCount,
    addToCart,
    updateCartItemQuantity,
    removeCartItem,
    clearCart,
  } = usePOS();

  // Modal states
  const [selectedProductForCustomization, setSelectedProductForCustomization] = useState<Product | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);

  // Filter products by category and search
  const filteredProducts = products.filter(product => {
    const matchesCategory = activeCategory === 'Todos' || product.category === activeCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleProductCardClick = (product: Product) => {
    if (!product.available) return;
    
    // If product has toppings enabled, open customizer; otherwise add directly
    if (product.toppingsAllowed) {
      setSelectedProductForCustomization(product);
    } else {
      addToCart(product, [], 1, '');
    }
  };

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    if (!product.available) return;
    addToCart(product, [], 1, '');
  };

  const handleCustomizerConfirm = (
    product: Product,
    toppings: SelectedTopping[],
    quantity: number,
    notes: string
  ) => {
    addToCart(product, toppings, quantity, notes);
  };

  const handlePaymentSuccess = (sale: Sale) => {
    setIsPaymentModalOpen(false);
    setCompletedSale(sale);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-3rem)] overflow-hidden bg-slate-100">
      
      {/* LEFT COLUMN: Catalog & Products */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Category bar & Search Header (Streamlined & Space-Saving) */}
        <div className="p-2.5 sm:p-3 bg-white border-b border-slate-200 shadow-2xs space-y-2 shrink-0">
          
          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                id="pos-search-input"
                value={searchQuery ?? ''}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar producto (Mangoneada, Nevada, Churros...)"
                className="w-full pl-8 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition text-slate-800"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-200 rounded-full w-4 h-4 flex items-center justify-center cursor-pointer"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills (Compact & Fast) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            <button
              type="button"
              id="cat-pill-todos"
              onClick={() => setActiveCategory('Todos')}
              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer border ${
                activeCategory === 'Todos'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Todos ({products.length})
            </button>
            
            {categories.map(cat => {
              const count = products.filter(p => p.category === cat).length;
              const isSelected = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  id={`cat-pill-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer border ${
                    isSelected
                      ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Grid Area (Maximized Visibility) */}
        <div className="flex-1 p-2.5 sm:p-4 overflow-y-auto">
          {filteredProducts.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 p-6 text-center">
              <UtensilsCrossed className="w-12 h-12 text-slate-300 mb-2" />
              <p className="font-semibold text-slate-600">No se encontraron productos</p>
              <p className="text-xs text-slate-400 mt-1">Prueba con otra categoría o término de búsqueda</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3.5 sm:gap-4 lg:gap-5">
              {filteredProducts.map(product => {
                return (
                  <div
                    key={product.id}
                    id={`pos-product-card-${product.id}`}
                    onClick={() => handleProductCardClick(product)}
                    className={`group relative bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-lg hover:-translate-y-0.5 transition-all overflow-hidden flex flex-col cursor-pointer select-none ${
                      !product.available ? 'opacity-60 grayscale' : 'hover:border-orange-500'
                    }`}
                  >
                    {/* Image Box */}
                    <div className="relative h-32 sm:h-36 md:h-40 xl:h-44 w-full bg-slate-100 overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        onError={handleImageError}
                      />
                      
                      {/* Price Pill Tag */}
                      <div className="absolute top-2.5 right-2.5 bg-slate-950/90 backdrop-blur-xs text-white px-2.5 py-1 rounded-xl text-xs sm:text-sm font-black shadow-md border border-white/10">
                        {formatCurrency(product.price)}
                      </div>

                      {/* Badge if available */}
                      {product.badge && (
                        <div className="absolute top-2.5 left-2.5 bg-amber-500 text-white text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-lg shadow-md">
                          {product.badge}
                        </div>
                      )}

                      {!product.available && (
                        <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-[2px] flex items-center justify-center">
                          <span className="bg-rose-600 text-white font-bold text-xs sm:text-sm px-3 py-1.5 rounded-xl shadow-md">
                            Agotado
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content Box */}
                    <div className="p-3.5 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-black text-orange-600 tracking-wider block mb-0.5">
                          {product.category}
                        </span>
                        <h4 className="font-black text-slate-800 text-sm sm:text-base leading-tight line-clamp-1 group-hover:text-orange-600 transition">
                          {product.name}
                        </h4>
                        <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-2 mt-1 leading-snug">
                          {product.description}
                        </p>
                      </div>

                      {/* Action Bar */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                          {product.toppingsAllowed ? (
                            <span className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/80 text-[11px] font-semibold">
                              <Sparkles className="w-3 h-3 text-amber-500" /> Extras
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Directo</span>
                          )}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {product.toppingsAllowed ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedProductForCustomization(product);
                              }}
                              className="w-8 h-8 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 flex items-center justify-center transition cursor-pointer"
                              title="Personalizar con extras y notas"
                            >
                              <SlidersHorizontal className="w-4 h-4" />
                            </button>
                          ) : null}

                          <button
                            type="button"
                            onClick={(e) => handleQuickAdd(e, product)}
                            disabled={!product.available}
                            className="w-8 h-8 rounded-xl bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white flex items-center justify-center shadow-xs transition cursor-pointer disabled:opacity-40"
                            title="Agregar rápido a la orden"
                          >
                            <Plus className="w-4 h-4 stroke-[3]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Interactive Cart & Checkout Panel */}
      <div className="w-full lg:w-[360px] xl:w-[390px] 2xl:w-[420px] bg-white border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col h-72 lg:h-full shrink-0 shadow-lg z-10">
        
        {/* Cart Header */}
        <div className="p-3 sm:p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Orden Actual</h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {cartItemCount} {cartItemCount === 1 ? 'artículo' : 'artículos'}
              </p>
            </div>
          </div>

          {cart.length > 0 && (
            <button
              type="button"
              id="clear-cart-btn"
              onClick={clearCart}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 hover:bg-rose-50 px-2 py-1 rounded-lg transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Vaciar
            </button>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 p-3 overflow-y-auto space-y-2.5 bg-slate-50/40">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-400 flex items-center justify-center mb-3">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <p className="font-bold text-slate-700 text-sm">El carrito está vacío</p>
              <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
                Selecciona productos del catálogo para armar la orden
              </p>
            </div>
          ) : (
            cart.map(item => (
              <div
                key={item.uid}
                id={`cart-item-${item.uid}`}
                className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-2xs space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      onError={handleImageError}
                      className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h5 className="font-bold text-slate-800 text-xs truncate">{item.name}</h5>
                      <span className="text-[11px] text-slate-500">
                        {formatCurrency(item.unitPrice)} c/u
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-black text-slate-900 text-sm block">
                      {formatCurrency(item.subtotal)}
                    </span>
                  </div>
                </div>

                {/* Toppings and notes if present */}
                {item.selectedToppings.length > 0 && (
                  <div className="text-[11px] bg-orange-50/60 text-orange-900 rounded-lg px-2 py-1 border border-orange-100 flex flex-wrap gap-1">
                    <span className="font-semibold text-orange-700">Extras:</span>
                    {item.selectedToppings.map(t => (
                      <span key={t.id} className="bg-white px-1.5 py-0.5 rounded text-[10px] border border-orange-200">
                        {t.name} (+${t.price.toFixed(2)})
                      </span>
                    ))}
                  </div>
                )}

                {item.notes && (
                  <p className="text-[11px] text-slate-500 italic bg-slate-50 px-2 py-0.5 rounded">
                    "{item.notes}"
                  </p>
                )}

                {/* Quantity and removal controls */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => removeCartItem(item.uid)}
                    className="text-slate-400 hover:text-rose-600 text-xs transition cursor-pointer p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
                    <button
                      type="button"
                      onClick={() => updateCartItemQuantity(item.uid, item.quantity - 1)}
                      className="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:bg-white transition cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-slate-800">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateCartItemQuantity(item.uid, item.quantity + 1)}
                      className="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:bg-white transition cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Bottom Summary & Checkout Button */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200 space-y-3">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Subtotal</span>
              <span>${cartTotal.toFixed(2)} USD</span>
            </div>
            <div className="flex justify-between items-baseline pt-1 border-t border-slate-100">
              <span className="font-bold text-slate-900 text-sm">TOTAL A COBRAR</span>
              <span className="text-2xl font-black text-slate-900">
                ${cartTotal.toFixed(2)} <span className="text-xs font-semibold text-slate-500">USD</span>
              </span>
            </div>
          </div>

          <button
            type="button"
            id="checkout-order-btn"
            disabled={cart.length === 0}
            onClick={() => setIsPaymentModalOpen(true)}
            className={`w-full flex items-center justify-between py-3.5 px-5 rounded-xl font-black text-sm tracking-wide shadow-md transition cursor-pointer ${
              cart.length > 0
                ? 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 active:from-orange-800 text-white'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              <span>COBRAR ORDEN</span>
            </div>
            <div className="flex items-center gap-1">
              <span>${cartTotal.toFixed(2)}</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      </div>

      {/* Product Customization Modal */}
      <ProductCustomizerModal
        product={selectedProductForCustomization}
        onClose={() => setSelectedProductForCustomization(null)}
        onConfirm={handleCustomizerConfirm}
      />

      {/* Checkout / Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={handlePaymentSuccess}
      />

      {/* Receipt Thermal Modal */}
      <ReceiptModal
        sale={completedSale}
        onClose={() => setCompletedSale(null)}
        onNewSale={() => {
          setCompletedSale(null);
        }}
      />
    </div>
  );
};
