import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { CreateOrderDto } from './order.dto';
import { OrderService } from './order.service';

@Controller()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('status/:id')
  async getOrderStatus(@Param('id') id) {
    const order = await this.orderService.get(id);
    return { status: order.status };
  }

  @Post()
  createOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
  }

  @Put('cancel/:id')
  cancelOrder(@Param('id') id) {
    return this.orderService.updateStatus(id, 'Cancelled');
  }
}
