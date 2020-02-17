import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { OrderController } from './order.controller';
import { CreateOrderDto } from './order.dto';
import { OrderService } from './order.service';
import { ORDER_SCHEMA_NAME, ORDER_SERVICE } from './order.type';

describe('OrderController', () => {
  test(`create order`, async () => {
    const { controller, emitToRedisMock } = await setup({
      mockModel: {
        create(dto: CreateOrderDto) {
          return Promise.resolve({
            _id: 'id',
            ...dto,
          });
        },
      },
    });

    const result = await controller.createOrder({
      total: 500,
      userId: 'userId',
    });

    expect(result).toMatchInlineSnapshot(`
        Object {
          "_id": "id",
          "total": 500,
          "userId": "userId",
        }
      `);

    expect(emitToRedisMock).toHaveBeenCalledTimes(1);
  });

  test(`view user orders`, async () => {
    const { controller } = await setup({
      mockModel: {
        find: () => ({
          sort: () => ({
            exec: () =>
              Promise.resolve([
                {
                  createdAt: new Date(2020, 1, 1),
                  updatedAt: new Date(2020, 1, 2),
                  toJSON: function() {
                    return {
                      _id: 'id',
                      userId: 'userId',
                      total: 100,
                    };
                  },
                },
                {
                  toJSON: function() {
                    return {
                      _id: 'id2',
                      userId: 'userId',
                      total: 30,
                    };
                  },
                },
              ]),
          }),
        }),
      },
    });

    const result = await controller.getOrdersForUser('userId');

    expect(result).toMatchInlineSnapshot(`
        Array [
          Object {
            "_id": "id",
            "createdAt": "02/01/2020",
            "total": 100,
            "updatedAt": "02/02/2020",
            "userId": "userId",
          },
          Object {
            "_id": "id2",
            "createdAt": "",
            "total": 30,
            "updatedAt": "",
            "userId": "userId",
          },
        ]
      `);
  });

  test(`view order status`, async () => {
    const { controller } = await setup({
      mockModel: {
        findById: id => ({
          exec: () =>
            Promise.resolve({
              _id: id,
              status: 'Confirmed',
            }),
        }),
      },
    });

    const result = await controller.getOrderStatus('orderId');

    expect(result).toMatchInlineSnapshot(`
      Object {
        "status": "Confirmed",
      }
    `);
  });
});

async function setup({ mockModel }) {
  const emitToRedisMock = jest.fn();

  const app: TestingModule = await Test.createTestingModule({
    imports: [
      ClientsModule.register([
        { name: ORDER_SERVICE, transport: Transport.TCP },
      ]),
    ],
    controllers: [OrderController],
    providers: [
      OrderService,
      {
        provide: getModelToken(ORDER_SCHEMA_NAME),
        useValue: mockModel,
      },
      {
        provide: ORDER_SERVICE,
        useValue: {
          emit: emitToRedisMock,
        },
      },
    ],
  }).compile();

  return {
    controller: app.get<OrderController>(OrderController),
    emitToRedisMock,
  };
}
