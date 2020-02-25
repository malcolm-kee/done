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
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ClientProxy, EventPattern } from '@nestjs/microservices';
import { Response } from 'express';
import * as moment from 'moment';
import { CreateOrderDto, UpdateOrderStatusWithPaymentDto } from './order.dto';
import { OrderService } from './order.service';
import { ORDER_SERVICE } from './order.type';
import { ApiResponse } from '@nestjs/swagger';

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
  @ApiResponse({
    status: 201,
    description: 'The order has been created successfully.',
  })
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    const order = await this.orderService.create(createOrderDto);
    this.client.emit('order_created', { ...createOrderDto, id: order._id });
    return order;
  }

  @Put('cancel/:orderId')
  @ApiResponse({
    status: 200,
    description: 'The order has been cancelled successfully.',
  })
  @ApiResponse({
    status: 409,
    description:
      'Cancellation not allowed as order payment has been processed.',
  })
  async cancelOrder(
    @Param('orderId') orderId: string,
    @Res() response: Response,
  ) {
    const order = await this.orderService.getOne(orderId);
    if (order.status !== 'Created') {
      logRaceCondition(orderId, 'Cancel order');
      return response.status(409).json(order);
    }

    const updatedOrder = await this.orderService.updateStatus(
      orderId,
      'Cancelled',
    );
    return response.json(updatedOrder);
  }

  @EventPattern('payment_process')
  @UsePipes(new ValidationPipe())
  async updateOrderStatusWithPayment(data: UpdateOrderStatusWithPaymentDto) {
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
