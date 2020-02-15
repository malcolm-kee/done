import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ClientProxy, EventPattern } from '@nestjs/microservices';
import { CreateOrderDto } from './order.dto';
import { OrderService } from './order.service';

@Controller()
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    @Inject('ORDER_SERVICE') private readonly client: ClientProxy,
  ) {}

  @Get('status/:id')
  async getOrderStatus(@Param('id') id) {
    const order = await this.orderService.get(id);
    return { status: order.status };
  }

  @Post()
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    const order = await this.orderService.create(createOrderDto);
    this.client.emit('order_created', { ...createOrderDto, id: order._id });
    return order;
  }

  @Put('cancel/:id')
  cancelOrder(@Param('id') id) {
    return this.orderService.updateStatus(id, 'Cancelled');
  }

  @EventPattern('payment_process')
  updateOrderStatusWithPayment(data: {
    id: string;
    result: 'success' | 'failure';
  }) {
    return this.orderService.updateStatus(
      data.id,
      data.result === 'success' ? 'Confirmed' : 'Cancelled',
    );
  }
}
