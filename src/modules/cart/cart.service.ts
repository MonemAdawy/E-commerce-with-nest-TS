import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CartDto } from './dto/cart.dto';
import { Types } from 'mongoose';
import { CartRepository } from 'src/DB/repository/cart.repository';
import { ProductRepository } from 'src/DB/repository/product.repository';
import { ProductDocument } from 'src/DB/models/product.model';
import { ProductService } from '../product/product.service';

@Injectable()
export class CartService {
  constructor(
    private readonly _CartRepository: CartRepository,
    private readonly _ProductRepository: ProductRepository,
    private readonly _ProductService: ProductService
  ) {}

  async addToCart(data: CartDto, userId: Types.ObjectId) {
    const { productId, quantity } = data;

    const product = await this._ProductService.checkProductExistence(productId);

    if (product!.stock < quantity) throw new NotFoundException('Insufficient stock');

    const cart = await this._CartRepository.findOne({filter: {user: userId, 'products.product': productId}});
    console.log(cart)
    if (cart) {
      const item = cart.products.find(item => item.product.toString() === productId.toString());

      const quantitySum = item!.quantity + quantity;

      if (product!.stock >= quantitySum) {
        item!.quantity = quantitySum;
        item!.price = product!.price * item!.quantity;
        await cart.save();
      }
      else {
        throw new BadRequestException(`Only ${product!.stock} items left in stock`);
      }
    } else {
      await this._CartRepository.update({filter: {user: userId}, update: {$push: {products: {product: productId, quantity, price: product!.price * quantity}}}});
    }
    const updatedCart = await this._CartRepository.findOne({filter: {user: userId}});

    return {data: updatedCart, message: 'Product added to cart successfully'};
  }

  async updateCart(data: CartDto, userId: Types.ObjectId) {
    const {productId, quantity} = data;

    const product = await this._ProductRepository.findOne({filter: {_id: productId}});

    if (!product) throw new NotFoundException('Product not found');

    if (product.stock < quantity) throw new NotFoundException('Insufficient stock');

    const cart = await this._CartRepository.update({
      filter: {user: userId, 'products.product': productId},
      update: {'products.$.quantity': quantity, 'products.$.price': product.finalPrice * quantity}
    });

    return {data: cart}
  }

  async clearCart(userId: Types.ObjectId) {
    const cart = await this._CartRepository.update({filter: {user: userId}, update: {products: []}})

    return {data: cart}
  }


  inStock(productId: ProductDocument, quantity: number) {
    return productId.stock >= quantity;
  }


  async getCart(userId: Types.ObjectId) {
    const cart = this._CartRepository.findOne({filter: {user: userId}})

    return cart;
  }
}
