import { Document } from 'mongoose';

export type OrderStatus = 'Created' | 'Confirmed' | 'Cancelled' | 'Delivered';

export type OrderData = {
  userId: string;
  total: number;
  status: OrderStatus;
};

export interface Order extends Document, OrderData {}
