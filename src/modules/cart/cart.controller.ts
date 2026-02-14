import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartDto } from './dto/cart.dto';
import { User } from 'src/common/decorators/user.decorator';
import { Types } from 'mongoose';
import { Roles } from 'src/DB/enums/user.enum';
import { Role } from 'src/common/decorators/roles.decorator';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Role(Roles.user)
  @Post('add-to-cart')
  async addToCart(@Body() data: CartDto, @User('_id') userId: Types.ObjectId) {
    return this.cartService.addToCart(data, userId);
  }

  @Role(Roles.user)
  @Patch()
  updateCart(@Body() data: CartDto, @User('_id') userId: Types.ObjectId) {
    return this.cartService.updateCart(data, userId);
  }

  @Role(Roles.user)
  @Patch('/clear')
  clearCart(@User('_id') userId: Types.ObjectId) {
    return this.cartService.clearCart(userId);
  }
}
