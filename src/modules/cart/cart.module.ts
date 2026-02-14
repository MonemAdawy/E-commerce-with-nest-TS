import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { CartRepository } from 'src/DB/repository/cart.repository';
import { CartModel } from 'src/DB/models/cart.model';
import { ProductModule } from '../product/product.module';
import { ProductRepository } from 'src/DB/repository/product.repository';
import { productModel } from 'src/DB/models/product.model';


@Module({
  controllers: [CartController],
  providers: [CartService, CartRepository, ProductRepository],
  imports: [CartModel, ProductModule],
  exports: [CartService, CartRepository, CartModel]
})
export class CartModule {}
