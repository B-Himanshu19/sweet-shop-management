export interface Sweet {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
  image_url?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface SweetCreate {
  name: string;
  category: string;
  price: number;
  quantity?: number;
  image_url?: string;
  description?: string;
}

export interface SweetUpdate {
  name?: string;
  category?: string;
  price?: number;
  quantity?: number;
  image_url?: string;
  description?: string;
}

export interface SweetSearchParams {
  name?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

