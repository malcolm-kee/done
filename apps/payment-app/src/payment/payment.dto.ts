import { IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class OrderDto {
  @IsString()
  @IsNotEmpty()
  readonly id: string;

  @IsString()
  @IsNotEmpty()
  readonly userId: string;

  @IsPositive()
  readonly total: number;
}
