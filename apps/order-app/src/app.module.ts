import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { OrderModule } from './order/order.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('ORDER_MONGODB_URL'),
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    OrderModule,
  ],
  controllers: [],
  providers: [Logger],
})
export class AppModule {}
