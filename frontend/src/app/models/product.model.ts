export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  stock: number;
  badge?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface LastOrder {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  orderNumber: string;
  orderDate: Date;
  address: string;
}
