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

export interface PurchaseCreate {
  user_id: number;
  sweet_id: number;
  sweet_name: string;
  category: string;
  price: number;
  quantity: number;
  total_amount: number;
}

