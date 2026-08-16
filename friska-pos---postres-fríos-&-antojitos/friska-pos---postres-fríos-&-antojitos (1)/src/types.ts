export type CategoryType = 'Mangoneadas' | 'Nevadas' | 'Chocobananos' | 'Churros' | 'Antojitos' | 'Bebidas Frías';

export type UserRole = 'CEO' | 'Supervisor' | 'Cajero' | 'Cocinero';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  createdAt: number;
  lastLogin: number;
  status: 'active' | 'inactive';
}

export interface Topping {
  id: string;
  name: string;
  price: number; // in USD e.g. 0.15, 0.25
  category?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // in USD
  category: CategoryType;
  image: string; // URL or base64 DataURL
  available: boolean;
  toppingsAllowed?: boolean;
  suggestedToppings?: string[]; // IDs or names
  badge?: string;
  createdAt: number;
}

export interface SelectedTopping {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  uid: string; // unique per cart line
  productId: string;
  name: string;
  basePrice: number;
  selectedToppings: SelectedTopping[];
  unitPrice: number; // basePrice + sum(toppings)
  quantity: number;
  notes: string;
  subtotal: number;
  image: string;
}

export type PaymentMethod = 'efectivo' | 'tarjeta' | 'transferencia';
export type OrderType = 'aqui' | 'llevar';
export type SaleStatus = 'completada' | 'cancelada';
export type KitchenStatus = 'preparando' | 'listo' | 'entregado';

export interface Sale {
  id: string; // e.g. "FRK-1001"
  orderNumber: number;
  date: string; // ISO string
  timestamp: number;
  createdAt: number; // UTC timestamp persisted in localStorage
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  changeGiven: number;
  customerName?: string;
  orderType: OrderType;
  status: SaleStatus;
  kitchenStatus?: KitchenStatus;
  kitchenUpdatedAt?: number;
  cancelReason?: string;
  canceledAt?: number;
  cashierName: string;
  shiftId: string;
}

export interface CashShift {
  id: string;
  openedAt: number;
  closedAt?: number;
  initialCash: number; // Monto inicial en caja (USD)
  status: 'open' | 'closed';
  cashierName: string;
  notes?: string;
}

export interface ShiftSummaryMetrics {
  totalSalesCount: number;
  activeSalesCount: number;
  canceledSalesCount: number;
  grossSales: number;
  canceledAmount: number;
  netSales: number;
  cashSales: number;
  cardSales: number;
  transferSales: number;
  initialCash: number;
  expectedCashInDrawer: number;
  averageTicket: number;
  itemsSoldTotal: number;
  topProducts: { name: string; quantity: number; revenue: number }[];
}
