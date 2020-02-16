import { Controller, Inject } from '@nestjs/common';
import { ClientProxy, EventPattern } from '@nestjs/microservices';
import { OrderDto } from './payment.type';

@Controller()
export class PaymentController {
  constructor(
    @Inject('PAYMENT_SERVICE') private readonly client: ClientProxy,
  ) {}

  @EventPattern('order_created')
  processPaymentForOrder(data: OrderDto) {
    this.client.emit('payment_process', {
      id: data.id,
      result: Math.random() > 0.5 ? 'success' : 'failure',
    });
  }
}
