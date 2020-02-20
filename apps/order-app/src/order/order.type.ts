import { Document } from 'mongoose';

export type OrderStatus = 'Created' | 'Confirmed' | 'Cancelled' | 'Delivered';

export type OrderData = {
  userId: string;
  total: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
};

export interface Order extends Document, OrderData {}

export const ORDER_SERVICE = 'ORDER_SERVICE';
export const ORDER_SCHEMA_NAME = 'Order';
