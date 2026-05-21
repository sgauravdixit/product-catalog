export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  image_url: string;
  created_at: string;
}

export interface ProductCreate {
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  image_url: string;
}
