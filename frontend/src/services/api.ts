import axios from 'axios';

const API_BASE_URL = (import.meta.env as any).VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration and errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token expired or invalid - clear auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login if not already there
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
}

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

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

export interface Purchase {
  id: number;
  user_id: number;
  username?: string; // Optional username from join
  sweet_id: number;
  sweet_name: string;
  category: string;
  price: number;
  quantity: number;
  total_amount: number;
  purchased_at: string;
}

export const authAPI = {
  register: async (username: string, email: string, password: string): Promise<RegisterResponse> => {
    const response = await api.post('/api/auth/register', { username, email, password });
    return response.data;
  },

  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await api.post('/api/auth/login', { username, password });
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },
};

export const sweetsAPI = {
  getAll: async (): Promise<Sweet[]> => {
    const response = await api.get('/api/sweets');
    return response.data;
  },

  getById: async (id: number): Promise<Sweet> => {
    const response = await api.get(`/api/sweets/${id}`);
    return response.data;
  },

  create: async (sweet: { name: string; category: string; price: number; quantity?: number; image_url?: string }): Promise<Sweet> => {
    const response = await api.post('/api/sweets', sweet);
    return response.data;
  },

  update: async (id: number, sweet: Partial<Sweet>): Promise<Sweet> => {
    const response = await api.put(`/api/sweets/${id}`, sweet);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/sweets/${id}`);
  },

  search: async (params: {
    name?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<Sweet[]> => {
    const queryParams = new URLSearchParams();
    if (params.name) queryParams.append('name', params.name);
    if (params.category) queryParams.append('category', params.category);
    if (params.minPrice !== undefined) queryParams.append('minPrice', params.minPrice.toString());
    if (params.maxPrice !== undefined) queryParams.append('maxPrice', params.maxPrice.toString());

    const response = await api.get(`/api/sweets/search?${queryParams.toString()}`);
    return response.data;
  },

  purchase: async (id: number, quantity: number = 1): Promise<{ message: string; sweet: Sweet }> => {
    const response = await api.post(`/api/sweets/${id}/purchase`, { quantity });
    return response.data;
  },

  restock: async (id: number, quantity: number): Promise<{ message: string; sweet: Sweet }> => {
    const response = await api.post(`/api/sweets/${id}/restock`, { quantity });
    return response.data;
  },
};

export const purchasesAPI = {
  getHistory: async (): Promise<Purchase[]> => {
    const response = await api.get('/api/purchases/history');
    return response.data;
  },

  getAll: async (): Promise<Purchase[]> => {
    const response = await api.get('/api/purchases/all');
    return response.data;
  },
};

export default api;

