import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { OrderRepository } from 'src/DB/repository/order.repository';
import { CartService } from '../cart/cart.service';
import { CartModule } from '../cart/cart.module';
import { OrderModel } from 'src/DB/models/order.model';
import { ProductModule } from '../product/product.module';
import { PaymentModule } from 'src/common/services/payment/payment.module';
import { OrderResolver } from './order.resolver';

@Module({
  controllers: [OrderController],
  providers: [OrderService, OrderRepository, CartService, OrderResolver],
  imports: [OrderModel, CartModule, ProductModule, PaymentModule]
})
export class OrderModule {}
