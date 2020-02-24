import { IsIn, IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  readonly userId: string;

  @IsPositive()
  readonly total: number;
}

export class UpdateOrderStatusWithPaymentDto {
  @IsString()
  @IsNotEmpty()
  readonly id: string;

  @IsIn(['confirmed', 'declined'])
  readonly result: 'confirmed' | 'declined';
}
