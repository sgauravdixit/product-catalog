import { Injectable } from '@angular/core';
import { Product } from '../models/product.model';

const PRODUCTS: Product[] = [
  {
    id: 1, name: 'Wireless Pro Headphones', category: 'Electronics', price: 79.99,
    description: 'Premium over-ear wireless headphones with 30-hour battery life, active noise cancellation, and crystal-clear audio quality perfect for music lovers.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    stock: 15, badge: 'NEW'
  },
  {
    id: 2, name: 'Ultra-Slim Laptop', category: 'Electronics', price: 899.00,
    description: 'Powerful 13-inch laptop with all-day battery life, a stunning Retina display, and lightning-fast performance for work and creative projects.',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80',
    stock: 8, badge: 'POPULAR'
  },
  {
    id: 3, name: 'Smart Watch Series X', category: 'Electronics', price: 249.99,
    description: 'Feature-packed smartwatch with health tracking, built-in GPS, and a gorgeous always-on AMOLED display. Available in multiple colours.',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
    stock: 22
  },
  {
    id: 4, name: 'Portable Speaker', category: 'Electronics', price: 59.99,
    description: 'Waterproof Bluetooth speaker with 360-degree immersive sound, 12-hour battery, and a compact rugged design for any adventure.',
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=600&q=80',
    stock: 30
  },
  {
    id: 5, name: 'Classic White Tee', category: 'Clothing', price: 24.99,
    description: 'Premium 100% organic cotton t-shirt with a relaxed unisex fit. A timeless wardrobe essential that pairs effortlessly with everything.',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80',
    stock: 50
  },
  {
    id: 6, name: 'Slim Fit Jeans', category: 'Clothing', price: 59.99,
    description: 'Modern slim-fit jeans in premium stretch denim. Designed for comfort and style, perfect from casual to smart-casual occasions.',
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=600&q=80',
    stock: 35
  },
  {
    id: 7, name: 'Running Sneakers', category: 'Clothing', price: 89.99,
    description: 'Lightweight high-performance running shoes with responsive cushioning and a breathable mesh upper. Built for speed and comfort.',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
    stock: 20, badge: 'HOT'
  },
  {
    id: 8, name: 'Bomber Jacket', category: 'Clothing', price: 129.00,
    description: 'Classic bomber jacket in premium satin-finish polyester with a cosy ribbed collar, cuffs, and hem. A timeless wardrobe staple.',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80',
    stock: 12
  },
  {
    id: 9, name: 'Espresso Machine', category: 'Home & Kitchen', price: 199.00,
    description: 'Compact 15-bar espresso machine with a built-in steam frother. Brew café-quality espresso, cappuccinos, and lattes at home.',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80',
    stock: 10
  },
  {
    id: 10, name: 'Nordic Table Lamp', category: 'Home & Kitchen', price: 49.99,
    description: 'Minimalist Scandinavian-style table lamp with warm 2700K LED lighting. Adds an instant cosy, ambient glow to any room.',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80',
    stock: 25
  },
  {
    id: 11, name: 'Ceramic Mug Set', category: 'Home & Kitchen', price: 34.99,
    description: 'Set of 4 hand-crafted ceramic mugs with a beautiful matte earthy-toned finish. Dishwasher and microwave safe.',
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=600&q=80',
    stock: 40
  },
  {
    id: 12, name: 'Cozy Throw Blanket', category: 'Home & Kitchen', price: 44.99,
    description: 'Ultra-soft chenille weave throw blanket in a generous 150×200 cm size. Machine washable — perfect for the sofa or bed.',
    image: 'https://images.unsplash.com/photo-1545438102-799c3991ffb2?auto=format&fit=crop&w=600&q=80',
    stock: 18
  },
  {
    id: 13, name: 'The Midnight Library', category: 'Books', price: 14.99,
    description: 'A dazzling novel about all the choices that go into a life well lived. Between life and death there is a library — what would you choose?',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80',
    stock: 100
  },
  {
    id: 14, name: 'The Art of Simple Food', category: 'Books', price: 24.99,
    description: 'A celebrated cookbook offering simple, beautifully seasonal cooking with the freshest ingredients. An essential guide for every kitchen.',
    image: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=600&q=80',
    stock: 60
  },
  {
    id: 15, name: 'Atomic Habits', category: 'Books', price: 16.99,
    description: 'Tiny changes, remarkable results. The life-changing guide on how to build good habits and break the bad ones.',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
    stock: 200, badge: 'BESTSELLER'
  },
  {
    id: 16, name: 'Sapiens', category: 'Books', price: 18.99,
    description: 'From the Stone Age to the Silicon Age — Yuval Noah Harari\'s sweeping history of humankind that changed how the world thinks about itself.',
    image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=600&q=80',
    stock: 75
  }
];

@Injectable({ providedIn: 'root' })
export class ProductService {
  getAll(): Product[] {
    return PRODUCTS;
  }

  getById(id: number): Product | undefined {
    return PRODUCTS.find(p => p.id === id);
  }

  getByCategory(category: string): Product[] {
    if (!category || category === 'All') return PRODUCTS;
    return PRODUCTS.filter(p => p.category === category);
  }

  search(query: string): Product[] {
    const q = query.toLowerCase().trim();
    if (!q) return PRODUCTS;
    return PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  }

  getCategories(): string[] {
    return ['Electronics', 'Clothing', 'Home & Kitchen', 'Books'];
  }

  getCountByCategory(cat: string): number {
    return PRODUCTS.filter(p => p.category === cat).length;
  }
}
