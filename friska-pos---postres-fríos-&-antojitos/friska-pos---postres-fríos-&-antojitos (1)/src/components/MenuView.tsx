import React, { useState } from 'react';
import { usePOS } from '../context/POSContext';
import { Product, CategoryType } from '../types';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Layers, 
  Sparkles, 
  UtensilsCrossed,
  Image as ImageIcon
} from 'lucide-react';
import { ProductFormModal } from './ProductFormModal';
import { handleImageError } from '../utils/imageFallback';
import { formatCurrency } from '../utils/currency';

export const MenuView: React.FC = () => {
  const {
    products,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductAvailability,
    restoreDefaultProducts,
  } = usePOS();

  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleSaveProduct = (productData: Omit<Product, 'id' | 'createdAt'>) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
    } else {
      addProduct(productData);
    }
  };

  const handleDelete = (product: Product) => {
    if (window.confirm(`¿Estás seguro de eliminar "${product.name}" del menú?`)) {
      deleteProduct(product.id);
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-slate-100">
      <div className="w-full max-w-[1920px] mx-auto space-y-6">
        
        {/* Top Banner / Actions Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-orange-100 text-orange-700 rounded-xl">
              <Layers className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Gestión del Menú & Catálogo</h1>
              <p className="text-xs text-slate-500">
                Administra tus productos, precios, fotos y disponibilidad en tiempo real
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            type="button"
            id="restore-defaults-btn"
            onClick={() => {
              if (window.confirm('¿Deseas restaurar los productos iniciales de Friska POS?')) {
                restoreDefaultProducts();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restaurar Catálogo
          </button>

          <button
            type="button"
            id="add-new-product-btn"
            onClick={handleOpenCreate}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="menu-search-input"
              value={searchTerm ?? ''}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar en el catálogo..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition text-slate-800"
            />
          </div>

          <span className="text-xs font-semibold text-slate-500 self-center">
            {filteredProducts.length} productos registrados
          </span>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory('Todos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
              selectedCategory === 'Todos'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Todos ({products.length})
          </button>

          {categories.map(cat => {
            const count = products.filter(p => p.category === cat).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border whitespace-nowrap ${
                  isSelected
                    ? 'bg-orange-600 text-white border-orange-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
          <UtensilsCrossed className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700 text-base">No hay productos en esta vista</h3>
          <p className="text-xs text-slate-400 mt-1">
            Intenta cambiar los filtros o agrega un nuevo producto con el botón superior
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              id={`menu-product-card-${product.id}`}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-lg transition-all overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Top image & badges */}
                <div className="relative h-44 sm:h-48 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition duration-300"
                    onError={handleImageError}
                  />
                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
                    <span className="bg-slate-900/85 backdrop-blur-xs text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      {product.category}
                    </span>
                    {product.badge && (
                      <span className="bg-amber-500 text-white px-2 py-0.5 rounded-md text-[10px] font-bold shadow-2xs">
                        {product.badge}
                      </span>
                    )}
                  </div>

                  <div className="absolute top-2.5 right-2.5 bg-slate-950/90 backdrop-blur-xs text-white px-2.5 py-1 rounded-xl text-xs sm:text-sm font-black shadow-md border border-white/10">
                    {formatCurrency(product.price)} USD
                  </div>
                </div>

                {/* Body info */}
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-slate-900 text-base leading-snug">{product.name}</h3>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {product.description || 'Sin descripción adicional.'}
                  </p>

                  <div className="pt-2 flex items-center gap-2 text-xs text-slate-500">
                    {product.toppingsAllowed ? (
                      <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 text-[11px] font-semibold flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500" /> Admite Extras
                      </span>
                    ) : (
                      <span className="text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200 text-[11px]">
                        Sin Extras
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom controls: Availability toggle + Edit / Delete */}
              <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                
                {/* Availability Switch */}
                <button
                  type="button"
                  id={`toggle-avail-${product.id}`}
                  onClick={() => toggleProductAvailability(product.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer border ${
                    product.available
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                  }`}
                >
                  {product.available ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Disponible</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Agotado</span>
                    </>
                  )}
                </button>

                {/* Edit and Delete buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    id={`edit-product-btn-${product.id}`}
                    onClick={() => handleOpenEdit(product)}
                    className="p-2 text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition cursor-pointer"
                    title="Editar producto e imagen"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    id={`delete-product-btn-${product.id}`}
                    onClick={() => handleDelete(product)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                    title="Eliminar producto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <ProductFormModal
        isOpen={isFormOpen}
        productToEdit={editingProduct}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveProduct}
      />
      </div>
    </div>
  );
};
