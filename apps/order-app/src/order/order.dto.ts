import { IsIn, IsNotEmpty, IsPositive, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({
    description: 'Id of the authenticated user',
  })
  @IsString()
  @IsNotEmpty()
  readonly userId: string;

  @ApiProperty({
    description: 'Total amount of the order in MYR',
  })
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
