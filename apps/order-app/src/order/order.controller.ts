import {
  Body,
  Controller,
  Get,
  Inject,
  Logger,
  Param,
  Post,
  Put,
  Res,
} from '@nestjs/common';
import { ClientProxy, EventPattern } from '@nestjs/microservices';
import { Response } from 'express';
import * as moment from 'moment';
import { CreateOrderDto } from './order.dto';
import { OrderService } from './order.service';
import { ORDER_SERVICE } from './order.type';

const logRaceCondition = (orderId: string, scenario: string) =>
  Logger.error(
    `Race condition [orderId: ${orderId}] - ${scenario} when order is no longer at created state`,
  );

@Controller()
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    @Inject(ORDER_SERVICE) private readonly client: ClientProxy,
  ) {}

  @Get('user/:userId')
  async getOrdersForUser(@Param('userId') userId: string) {
    const orders = await this.orderService.getOrdersForUser(userId);
    return orders.map(order => ({
      ...order.toJSON(),
      createdAt: order.createdAt ? moment(order.createdAt).calendar() : '',
      updatedAt: order.updatedAt ? moment(order.updatedAt).calendar() : '',
    }));
  }

  @Get('status/:id')
  async getOrderStatus(@Param('id') id: string) {
    const order = await this.orderService.getOne(id);

    return { status: order.status };
  }

  @Post()
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    const order = await this.orderService.create(createOrderDto);
    this.client.emit('order_created', { ...createOrderDto, id: order._id });
    return order;
  }

  @Put('cancel/:id')
  async cancelOrder(@Param('id') id, @Res() response: Response) {
    const order = await this.orderService.getOne(id);
    if (order.status !== 'Created') {
      logRaceCondition(id, 'Cancel order');
      return response.status(409).json(order);
    }

    const updatedOrder = await this.orderService.updateStatus(id, 'Cancelled');
    return response.json(updatedOrder);
  }

  @EventPattern('payment_process')
  async updateOrderStatusWithPayment(data: {
    id: string;
    result: 'confirmed' | 'declined';
  }) {
    const order = await this.orderService.getOne(data.id);

    if (order.status !== 'Created') {
      logRaceCondition(data.id, 'Payment success');
    } else {
      return this.orderService.updateStatus(
        data.id,
        data.result === 'confirmed' ? 'Confirmed' : 'Cancelled',
      );
    }
  }
}
