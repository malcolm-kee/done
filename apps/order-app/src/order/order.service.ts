import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateOrderDto } from './order.dto';
import { Order, OrderStatus } from './order.type';
import { Interval } from '@nestjs/schedule';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel('Order') private readonly orderModel: Model<Order>,
  ) {}

  async get(id: string): Promise<Order> {
    return this.orderModel.findById(id).exec();
  }

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const createdOrder = new this.orderModel(createOrderDto);
    return createdOrder.save();
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const order = await this.orderModel.findById(id).exec();
    order.status = status;
    return order.save();
  }

  @Interval(10_000)
  /**
   * Update all 'Confirmed' orders to 'Delivered'
   */
  async cleanupOrders() {
    const orders = await this.orderModel
      .find({
        status: {
          $eq: 'Confirmed',
        },
      })
      .exec();

    return Promise.all(
      orders.map(order => {
        order.status = 'Delivered';
        return order.save();
      }),
    );
  }
}
