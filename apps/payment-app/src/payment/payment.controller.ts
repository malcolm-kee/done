import { Controller, Inject, UsePipes, ValidationPipe } from '@nestjs/common';
import { ClientProxy, EventPattern } from '@nestjs/microservices';
import { OrderDto } from './payment.dto';

@Controller()
export class PaymentController {
  constructor(
    @Inject('PAYMENT_SERVICE') private readonly client: ClientProxy,
  ) {}

  @EventPattern('order_created')
  @UsePipes(new ValidationPipe())
  processPaymentForOrder(data: OrderDto) {
    this.client.emit('payment_process', {
      id: data.id,
      result: Math.random() > 0.5 ? 'confirmed' : 'declined',
    });
  }
}
