import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { Product, CartItem, SelectedTopping, Sale, CashShift, ShiftSummaryMetrics, PaymentMethod, OrderType, Topping, CategoryType, KitchenStatus } from '../types';
import { INITIAL_PRODUCTS, INITIAL_TOPPINGS, INITIAL_DEMO_SALES } from '../data/initialData';
import { roundCurrency } from '../utils/currency';
import { useAuth } from './AuthContext';

interface BusinessSettings {
  name: string;
  slogan: string;
  phone: string;
  address: string;
  receiptFooter: string;
  currencySymbol: string;
  cashierName: string;
}

interface POSContextType {
  products: Product[];
  categories: CategoryType[];
  toppings: Topping[];
  cart: CartItem[];
  sales: Sale[];
  currentShift: CashShift;
  businessSettings: BusinessSettings;
  activeCategory: string;
  searchQuery: string;
  metrics: ShiftSummaryMetrics;
  pendingKitchenCount: number;
  
  // Navigation / Filter Setters
  setActiveCategory: (cat: string) => void;
  setSearchQuery: (query: string) => void;
  
  // Cart Actions
  addToCart: (product: Product, selectedToppings?: SelectedTopping[], quantity?: number, notes?: string) => void;
  updateCartItemQuantity: (uid: string, quantity: number) => void;
  removeCartItem: (uid: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartItemCount: number;
  
  // Sales Actions
  completeSale: (data: {
    paymentMethod: PaymentMethod;
    amountPaid: number;
    changeGiven: number;
    customerName?: string;
    orderType: OrderType;
    discount?: number;
  }) => Sale;
  cancelSale: (saleId: string, reason?: string) => boolean;
  updateKitchenStatus: (saleId: string, status: KitchenStatus) => void;
  
  // Product Management
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  toggleProductAvailability: (id: string) => void;
  
  // Shift Management
  openShift: (initialCash: number, cashierName?: string) => void;
  closeShift: (notes?: string) => void;
  resetShiftSales: () => void;
  
  // Business Settings
  updateBusinessSettings: (settings: Partial<BusinessSettings>) => void;
  
  // Utilities
  generateWhatsAppSummary: (customPhone?: string) => { text: string; url: string };
  restoreDefaultProducts: () => void;
}

const STORAGE_KEYS = {
  PRODUCTS: 'friska_pos_products_v1',
  SALES: 'friska_pos_sales_v1',
  SHIFT: 'friska_pos_shift_v1',
  SETTINGS: 'friska_pos_settings_v1',
  CART: 'friska_pos_cart_v1',
};

const DEFAULT_SETTINGS: BusinessSettings = {
  name: 'Friska POS',
  slogan: 'Postres Fríos & Antojitos',
  phone: '50371234567',
  address: 'Plaza Principal, Kiosco #4',
  receiptFooter: '¡Gracias por disfrutar de nuestros postres fríos y antojitos!',
  currencySymbol: '$',
  cashierName: 'Cajero Principal',
};

const DEFAULT_SHIFT: CashShift = {
  id: 'shift-' + Date.now(),
  openedAt: Date.now(),
  initialCash: 0.00, // Inicia en $0.00 como solicitado
  status: 'open',
  cashierName: 'Cajero Principal',
};

const POSContext = createContext<POSContextType | undefined>(undefined);

export const POSProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { userProfile, user } = useAuth();
  const currentCashierName = userProfile?.displayName || user?.email || 'Cajero Principal';

  // Load products
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading products from storage', e);
    }
    return INITIAL_PRODUCTS;
  });

  // Load sales
  const [sales, setSales] = useState<Sale[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SALES);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading sales from storage', e);
    }
    return INITIAL_DEMO_SALES;
  });

  // Load shift
  const [currentShift, setCurrentShift] = useState<CashShift>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SHIFT);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading shift from storage', e);
    }
    return DEFAULT_SHIFT;
  });

  // Load settings
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Error loading settings from storage', e);
    }
    return DEFAULT_SETTINGS;
  });

  // Active cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading cart', e);
    }
    return [];
  });

  const [toppings] = useState<Topping[]>(INITIAL_TOPPINGS);
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Persist changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.error(e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
    } catch (e) {
      console.error(e);
    }
  }, [sales]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SHIFT, JSON.stringify(currentShift));
    } catch (e) {
      console.error(e);
    }
  }, [currentShift]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(businessSettings));
    } catch (e) {
      console.error(e);
    }
  }, [businessSettings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Categories list
  const categories: CategoryType[] = useMemo(() => {
    return ['Mangoneadas', 'Nevadas', 'Chocobananos', 'Churros', 'Antojitos', 'Bebidas Frías'];
  }, []);

  // Cart totals
  const cartTotal = useMemo(() => {
    return roundCurrency(cart.reduce((sum, item) => sum + item.subtotal, 0));
  }, [cart]);

  const cartItemCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  // Cart operations
  const addToCart = (
    product: Product,
    selectedToppings: SelectedTopping[] = [],
    quantity: number = 1,
    notes: string = ''
  ) => {
    const toppingsCost = roundCurrency(selectedToppings.reduce((acc, t) => acc + t.price, 0));
    const unitPrice = roundCurrency(product.price + toppingsCost);
    const toppingsKey = selectedToppings.map(t => t.id).sort().join(',');

    setCart(prev => {
      // Check if identical item (same product, same toppings, same notes) exists
      const existingIndex = prev.findIndex(
        item =>
          item.productId === product.id &&
          item.notes === notes &&
          item.selectedToppings.map(t => t.id).sort().join(',') === toppingsKey
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          subtotal: roundCurrency(newQty * unitPrice),
        };
        return updated;
      }

      const newItem: CartItem = {
        uid: 'cart-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
        productId: product.id,
        name: product.name,
        basePrice: roundCurrency(product.price),
        selectedToppings,
        unitPrice,
        quantity,
        notes,
        subtotal: roundCurrency(quantity * unitPrice),
        image: product.image,
      };
      return [...prev, newItem];
    });
  };

  const updateCartItemQuantity = (uid: string, quantity: number) => {
    if (quantity <= 0) {
      removeCartItem(uid);
      return;
    }
    setCart(prev =>
      prev.map(item => {
        if (item.uid === uid) {
          return {
            ...item,
            quantity,
            subtotal: roundCurrency(quantity * item.unitPrice),
          };
        }
        return item;
      })
    );
  };

  const removeCartItem = (uid: string) => {
    setCart(prev => prev.filter(item => item.uid !== uid));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Complete a sale
  const completeSale = (data: {
    paymentMethod: PaymentMethod;
    amountPaid: number;
    changeGiven: number;
    customerName?: string;
    orderType: OrderType;
    discount?: number;
  }): Sale => {
    const rawSubtotal = roundCurrency(cartTotal);
    const discount = roundCurrency(data.discount || 0);
    const finalTotal = Math.max(0, roundCurrency(rawSubtotal - discount));

    const nextOrderNumber = sales.length + 1;
    const padNumber = String(nextOrderNumber).padStart(4, '0');
    const saleId = `FRK-${padNumber}`;
    const nowUtc = Date.now();

    const newSale: Sale = {
      id: saleId,
      orderNumber: nextOrderNumber,
      date: new Date().toISOString(),
      timestamp: nowUtc,
      createdAt: nowUtc, // Persisted UTC timestamp for timer resilience across page reloads
      items: [...cart],
      subtotal: rawSubtotal,
      discount,
      total: finalTotal,
      paymentMethod: data.paymentMethod,
      amountPaid: roundCurrency(data.amountPaid),
      changeGiven: roundCurrency(data.changeGiven),
      customerName: data.customerName?.trim() || 'Cliente General',
      orderType: data.orderType,
      status: 'completada',
      kitchenStatus: 'preparando',
      kitchenUpdatedAt: nowUtc,
      cashierName: currentCashierName,
      shiftId: currentShift.id,
    };

    setSales(prev => [newSale, ...prev]);
    clearCart();
    return newSale;
  };

  // Update Kitchen / Order status
  const updateKitchenStatus = (saleId: string, status: KitchenStatus) => {
    setSales(prev =>
      prev.map(sale => {
        if (sale.id === saleId) {
          return {
            ...sale,
            kitchenStatus: status,
            kitchenUpdatedAt: Date.now(),
          };
        }
        return sale;
      })
    );
  };

  // Cancel / Anular a sale
  const cancelSale = (saleId: string, reason: string = 'Solicitado por cajero / cliente'): boolean => {
    let found = false;
    setSales(prev =>
      prev.map(sale => {
        if (sale.id === saleId && sale.status !== 'cancelada') {
          found = true;
          return {
            ...sale,
            status: 'cancelada',
            cancelReason: reason,
            canceledAt: Date.now(),
          };
        }
        return sale;
      })
    );
    return found;
  };

  // Product CRUD
  const addProduct = (productData: Omit<Product, 'id' | 'createdAt'>): Product => {
    const newProduct: Product = {
      ...productData,
      id: 'prod-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      createdAt: Date.now(),
    };
    setProducts(prev => [newProduct, ...prev]);
    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const toggleProductAvailability = (id: string) => {
    setProducts(prev =>
      prev.map(p => (p.id === id ? { ...p, available: !p.available } : p))
    );
  };

  const restoreDefaultProducts = () => {
    setProducts(INITIAL_PRODUCTS);
  };

  // Shift management
  const openShift = (initialCash: number = 0.00, cashierName?: string) => {
    const newShift: CashShift = {
      id: 'shift-' + Date.now(),
      openedAt: Date.now(),
      initialCash: Number(initialCash) || 0.00,
      status: 'open',
      cashierName: cashierName || businessSettings.cashierName || 'Cajero Principal',
    };
    setCurrentShift(newShift);
  };

  const closeShift = (notes?: string) => {
    setCurrentShift(prev => ({
      ...prev,
      closedAt: Date.now(),
      status: 'closed',
      notes,
    }));
  };

  const resetShiftSales = () => {
    // Starts a fresh shift at $0.00 and clears sales associated with current shift
    const newShiftId = 'shift-' + Date.now();
    setCurrentShift({
      id: newShiftId,
      openedAt: Date.now(),
      initialCash: 0.00,
      status: 'open',
      cashierName: currentCashierName,
    });
  };

  const updateBusinessSettings = (updates: Partial<BusinessSettings>) => {
    setBusinessSettings(prev => ({ ...prev, ...updates }));
  };

  // Shift metrics calculation
  const metrics: ShiftSummaryMetrics = useMemo(() => {
    // Filter sales belonging to current active shift
    const shiftSales = sales.filter(s => s.shiftId === currentShift.id);

    let activeSalesCount = 0;
    let canceledSalesCount = 0;
    let grossSales = 0;
    let canceledAmount = 0;
    let netSales = 0;
    let cashSales = 0;
    let cardSales = 0;
    let transferSales = 0;
    let itemsSoldTotal = 0;

    const productSalesMap: Record<string, { quantity: number; revenue: number }> = {};

    shiftSales.forEach(sale => {
      grossSales += sale.total;

      if (sale.status === 'cancelada') {
        canceledSalesCount += 1;
        canceledAmount += sale.total;
      } else {
        // Active completed sale
        activeSalesCount += 1;
        netSales += sale.total;

        if (sale.paymentMethod === 'efectivo') {
          cashSales += sale.total;
        } else if (sale.paymentMethod === 'tarjeta') {
          cardSales += sale.total;
        } else if (sale.paymentMethod === 'transferencia') {
          transferSales += sale.total;
        }

        // Tally items
        sale.items.forEach(item => {
          itemsSoldTotal += item.quantity;
          if (!productSalesMap[item.name]) {
            productSalesMap[item.name] = { quantity: 0, revenue: 0 };
          }
          productSalesMap[item.name].quantity += item.quantity;
          productSalesMap[item.name].revenue += item.subtotal;
        });
      }
    });

    const topProducts = Object.entries(productSalesMap)
      .map(([name, data]) => ({
        name,
        quantity: data.quantity,
        revenue: roundCurrency(data.revenue),
      }))
      .sort((a, b) => b.quantity - a.quantity);

    const initialCash = roundCurrency(currentShift.initialCash || 0.00);
    const expectedCashInDrawer = roundCurrency(initialCash + cashSales);
    const averageTicket = activeSalesCount > 0 ? roundCurrency(netSales / activeSalesCount) : 0.00;

    return {
      totalSalesCount: shiftSales.length,
      activeSalesCount,
      canceledSalesCount,
      grossSales: roundCurrency(grossSales),
      canceledAmount: roundCurrency(canceledAmount),
      netSales: roundCurrency(netSales),
      cashSales: roundCurrency(cashSales),
      cardSales: roundCurrency(cardSales),
      transferSales: roundCurrency(transferSales),
      initialCash,
      expectedCashInDrawer,
      averageTicket,
      itemsSoldTotal,
      topProducts,
    };
  }, [sales, currentShift]);

  // Kitchen pending orders count (active sales not delivered yet)
  const pendingKitchenCount = useMemo(() => {
    return sales.filter(
      s => s.status !== 'cancelada' && (s.kitchenStatus || 'preparando') !== 'entregado'
    ).length;
  }, [sales]);

  // WhatsApp Summary Generator
  const generateWhatsAppSummary = (customPhone?: string) => {
    const dateFormatted = new Date().toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const timeFormatted = new Date().toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const shiftDurationHours = Math.max(
      0.1,
      Math.round(((Date.now() - currentShift.openedAt) / (1000 * 60 * 60)) * 10) / 10
    );

    let topProductsText = '';
    if (metrics.topProducts.length > 0) {
      topProductsText = metrics.topProducts
        .slice(0, 5)
        .map((p, idx) => `  ${idx + 1}. *${p.name}*: ${p.quantity} uds ($${p.revenue.toFixed(2)})`)
        .join('\n');
    } else {
      topProductsText = '  (Sin productos vendidos aún)';
    }

    const text = 
`🍧 *CIERRE DE CAJA & RESUMEN DE VENTAS* 🍧
🏪 *${businessSettings.name}* - ${businessSettings.slogan}
📅 *Fecha:* ${dateFormatted} (${timeFormatted})
👤 *Cajero:* ${businessSettings.cashierName}
⏱️ *Duración del Turno:* ~${shiftDurationHours} hrs

━━━━━━━━━━━━━━━━━━━
💰 *BALANCE FINANCIERO (USD $)*
━━━━━━━━━━━━━━━━━━━
💵 *Fondo Inicial en Caja:* $${metrics.initialCash.toFixed(2)}
📈 *VENTAS TOTALES NETAS:* $${metrics.netSales.toFixed(2)}
🧾 *Órdenes Atendidas:* ${metrics.activeSalesCount}
🏷️ *Ticket Promedio:* $${metrics.averageTicket.toFixed(2)}
📦 *Unidades Vendidas:* ${metrics.itemsSoldTotal}

━━━━━━━━━━━━━━━━━━━
💳 *DESGLOSE POR MÉTODO DE PAGO*
━━━━━━━━━━━━━━━━━━━
💵 *Efectivo Recaudado:* $${metrics.cashSales.toFixed(2)}
💳 *Tarjeta:* $${metrics.cardSales.toFixed(2)}
📲 *Transferencia / QR:* $${metrics.transferSales.toFixed(2)}

🏧 *DINERO TOTAL ESPERADO EN CAJA:*
➡️ *$${metrics.expectedCashInDrawer.toFixed(2)} USD*
_(Fondo Inicial $${metrics.initialCash.toFixed(2)} + Efectivo $${metrics.cashSales.toFixed(2)})_

━━━━━━━━━━━━━━━━━━━
⚠️ *ANULACIONES & CANCELACIONES*
━━━━━━━━━━━━━━━━━━━
🚫 *Ventas Anuladas:* ${metrics.canceledSalesCount}
💸 *Monto Anulado (Descontado):* $${metrics.canceledAmount.toFixed(2)}

━━━━━━━━━━━━━━━━━━━
🏆 *TOP PRODUCTOS MÁS VENDIDOS*
━━━━━━━━━━━━━━━━━━━
${topProductsText}

✨ _Reporte generado automáticamente por Friska POS_`;

    const rawPhone = (customPhone || businessSettings.phone || '').trim();
    // Keep numbers and optional leading plus sign
    const cleanPhone = rawPhone.replace(/[^\d]/g, '');
    const encodedText = encodeURIComponent(text);
    const url = cleanPhone
      ? `https://api.whatsapp.com/send?phone=${encodeURIComponent(cleanPhone)}&text=${encodedText}`
      : `https://api.whatsapp.com/send?text=${encodedText}`;

    return { text, url };
  };

  return (
    <POSContext.Provider
      value={{
        products,
        categories,
        toppings,
        cart,
        sales,
        currentShift,
        businessSettings,
        activeCategory,
        searchQuery,
        metrics,
        pendingKitchenCount,
        setActiveCategory,
        setSearchQuery,
        addToCart,
        updateCartItemQuantity,
        removeCartItem,
        clearCart,
        cartTotal,
        cartItemCount,
        completeSale,
        cancelSale,
        updateKitchenStatus,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductAvailability,
        openShift,
        closeShift,
        resetShiftSales,
        updateBusinessSettings,
        generateWhatsAppSummary,
        restoreDefaultProducts,
      }}
    >
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = () => {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
};
