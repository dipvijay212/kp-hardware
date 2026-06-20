export interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  description: string;
  image: string;
  stock: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
