import React, { useState, useEffect, useRef } from 'react';
import { Product, CategoryType } from '../types';
import { usePOS } from '../context/POSContext';
import { 
  X, 
  Upload, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  DollarSign, 
  Sparkles, 
  Check, 
  AlertCircle,
  Camera,
  Loader2
} from 'lucide-react';
import { handleImageError } from '../utils/imageFallback';
import { roundCurrency } from '../utils/currency';

interface Props {
  isOpen: boolean;
  productToEdit?: Product | null;
  onClose: () => void;
  onSave: (productData: Omit<Product, 'id' | 'createdAt'>) => void;
}

export const ProductFormModal: React.FC<Props> = ({
  isOpen,
  productToEdit,
  onClose,
  onSave,
}) => {
  const { categories } = usePOS();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [priceStr, setPriceStr] = useState<string>('');
  const [category, setCategory] = useState<CategoryType>('Mangoneadas');
  const [image, setImage] = useState<string>('');
  const [available, setAvailable] = useState<boolean>(true);
  const [toppingsAllowed, setToppingsAllowed] = useState<boolean>(true);
  const [badge, setBadge] = useState<string>('');
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
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

  // Sample fallback images by category if user leaves it empty
  const defaultCategoryImages: Record<CategoryType, string> = {
    Mangoneadas: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=600&q=80',
    Nevadas: 'https://images.unsplash.com/photo-1505394033641-40c6ad1178d7?auto=format&fit=crop&w=600&q=80',
    Churros: 'https://images.unsplash.com/photo-1624300629298-e9de39c13be5?auto=format&fit=crop&w=600&q=80',
    Chocobananos: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80',
    Antojitos: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=600&q=80',
    'Bebidas Frías': 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
  };

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name ?? '');
      setDescription(productToEdit.description ?? '');
      setPriceStr(productToEdit.price !== undefined && productToEdit.price !== null ? productToEdit.price.toString() : '');
      setCategory(productToEdit.category ?? 'Mangoneadas');
      setImage(productToEdit.image ?? '');
      setAvailable(productToEdit.available ?? true);
      setToppingsAllowed(productToEdit.toppingsAllowed ?? true);
      setBadge(productToEdit.badge ?? '');
      setImageMode(productToEdit.image && productToEdit.image.startsWith('data:') ? 'upload' : 'url');
    } else {
      setName('');
      setDescription('');
      setPriceStr('');
      setCategory('Mangoneadas');
      setImage('');
      setAvailable(true);
      setToppingsAllowed(true);
      setBadge('');
      setImageMode('upload');
    }
    setErrorMsg('');
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Por favor selecciona un archivo de imagen válido (JPG, PNG, WEBP, etc.)');
      return;
    }
    setErrorMsg('');
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!name.trim()) {
      setErrorMsg('El nombre del producto es obligatorio.');
      return;
    }

    const priceNum = parseFloat(priceStr);
    if (isNaN(priceNum) || priceNum < 0) {
      setErrorMsg('Por favor ingresa un precio válido en USD ($).');
      return;
    }

    setIsSubmitting(true);
    try {
      const finalImage = image.trim() || defaultCategoryImages[category] || defaultCategoryImages.Mangoneadas;

      onSave({
        name: name.trim(),
        description: description.trim(),
        price: roundCurrency(priceNum),
        category,
        image: finalImage,
        available,
        toppingsAllowed,
        badge: badge.trim() || undefined,
      });

      onClose();
    } catch (err) {
      console.error('Error saving product:', err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
      <div 
        id="product-form-modal"
        className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-orange-600 to-amber-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {productToEdit ? 'Editar Producto del Menú' : 'Crear Nuevo Producto'}
              </h2>
              <p className="text-xs text-orange-100">
                Personaliza precio, categoría e imagen del producto
              </p>
            </div>
          </div>
          <button
            id="close-product-form-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-slate-800">
          
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Product Name */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
              Nombre del Producto *
            </label>
            <input
              type="text"
              id="product-name-input"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ej: Mangoneada Suprema, Nevada de Fresa..."
              className="w-full text-sm font-medium px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
            />
          </div>

          {/* Category and Price in Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
                Categoría *
              </label>
              <select
                id="product-category-select"
                value={category}
                onChange={e => setCategory(e.target.value as CategoryType)}
                className="w-full text-sm font-medium px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition cursor-pointer"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
                Precio (USD $) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  id="product-price-input"
                  required
                  value={priceStr}
                  onChange={e => setPriceStr(e.target.value)}
                  placeholder="0.50"
                  className="w-full text-sm font-bold pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
              Descripción de Ingredientes / Sabor
            </label>
            <textarea
              rows={2}
              id="product-description-input"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Ej: Nieve artesanal de mango natural con chamoy, tajín y limón recién exprimido..."
              className="w-full text-sm px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
            />
          </div>

          {/* IMAGE ATTACHMENT SECTION (Subir Imagen / URL) */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-orange-600" />
                Fotografía del Producto
              </label>
              
              {/* Tab Selector: Upload vs URL */}
              <div className="flex bg-slate-200/80 p-0.5 rounded-lg text-xs font-bold">
                <button
                  type="button"
                  id="tab-image-upload"
                  onClick={() => setImageMode('upload')}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                    imageMode === 'upload' ? 'bg-white text-orange-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Upload className="w-3 h-3 inline mr-1" />
                  Subir Archivo
                </button>
                <button
                  type="button"
                  id="tab-image-url"
                  onClick={() => setImageMode('url')}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                    imageMode === 'url' ? 'bg-white text-orange-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LinkIcon className="w-3 h-3 inline mr-1" />
                  URL Web
                </button>
              </div>
            </div>

            {/* Upload Area */}
            {imageMode === 'upload' ? (
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  id="product-image-file-input"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center ${
                    isDragging
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-slate-300 hover:border-orange-400 bg-white'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mb-2">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-700">
                    Haz clic para adjuntar foto o arrastra aquí
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Soporta imágenes de tu celular o computadora (JPG, PNG, WEBP)
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <input
                  type="url"
                  id="product-image-url-input"
                  value={image}
                  onChange={e => setImage(e.target.value)}
                  placeholder="https://ejemplo.com/foto-postre.jpg"
                  className="w-full text-xs font-mono px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                />
              </div>
            )}

            {/* Live Image Preview */}
            {image && (
              <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200">
                <img
                  src={image}
                  alt="Vista previa"
                  className="w-14 h-14 rounded-lg object-cover bg-slate-100 border"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = defaultCategoryImages[category] || defaultCategoryImages.Mangoneadas;
                  }}
                />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Imagen cargada correctamente
                  </span>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {image.startsWith('data:') ? 'Imagen local en memoria' : image}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setImage('')}
                  className="text-xs text-rose-500 hover:text-rose-700 px-2 py-1 cursor-pointer"
                >
                  Quitar
                </button>
              </div>
            )}
          </div>

          {/* Options: Badge, Toppings Toggle, Available Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            
            {/* Badge */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Etiqueta / Badge
              </label>
              <input
                type="text"
                id="product-badge-input"
                value={badge}
                onChange={e => setBadge(e.target.value)}
                placeholder="Ej: 🔥 Popular"
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            {/* Toppings allowed toggle */}
            <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
              <div>
                <span className="text-xs font-bold text-slate-700 block">Extras</span>
                <span className="text-[10px] text-slate-400">Permitir toppings</span>
              </div>
              <input
                type="checkbox"
                id="product-toppings-toggle"
                checked={toppingsAllowed}
                onChange={e => setToppingsAllowed(e.target.checked)}
                className="w-4 h-4 text-orange-600 rounded cursor-pointer"
              />
            </div>

            {/* Available in stock */}
            <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
              <div>
                <span className="text-xs font-bold text-slate-700 block">Disponible</span>
                <span className="text-[10px] text-slate-400">Activo para venta</span>
              </div>
              <input
                type="checkbox"
                id="product-available-toggle"
                checked={available}
                onChange={e => setAvailable(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Form Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              id="cancel-product-form-btn"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-300 hover:bg-slate-100 disabled:opacity-50 rounded-xl text-xs font-bold text-slate-700 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="save-product-form-btn"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-400 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Guardando...</span>
                </>
              ) : (
                <span>{productToEdit ? 'Guardar Cambios' : 'Crear Producto'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
