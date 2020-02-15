import * as mongoose from 'mongoose';
import { Order, OrderStatus } from './order.type';

export const OrderSchema = new mongoose.Schema<Order>({
  userId: String,
  total: Number,
  status: {
    type: String,
    enum: ['Created', 'Confirmed', 'Cancelled', 'Delivered'] as OrderStatus[],
    default: 'Created',
  },
});
