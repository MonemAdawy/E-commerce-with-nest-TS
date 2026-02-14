import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { User } from 'src/common/decorators/user.decorator';
import { UserDocument } from 'src/DB/models/user.model';
import { OrderRepository } from 'src/DB/repository/order.repository';
import { Role } from 'src/common/decorators/roles.decorator';
import { Roles } from 'src/DB/enums/user.enum';
import { Public } from 'src/common/decorators/public.decorator';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Controller('order')
export class OrderController {
  constructor(
    private readonly _OrderService: OrderService,
  ) {}

  @Role(Roles.user)
  @Post('create-order')
  async create(@Body() data: CreateOrderDto, @User() user: UserDocument) {
    return this._OrderService.create(data, user);
  }


  @Post('/webhook')
  @Public()
  async stripWebhook(@Body() data: any) {
    console.log({data})
    await this._OrderService.stripWebhook(data);
    return
  }

  @Role(Roles.user)
  @Post('/cancel/:id')
  async cancelOrder(
    @Param('id', ParseObjectIdPipe) orderId : Types.ObjectId, 
    @User('_id') userId: Types.ObjectId
  ) {
    return this._OrderService.cancelOrder(orderId, userId);
  }


  @Public()
  @Get('/redis')
  async testRedis()
  {
    return this._OrderService.testRedis();
  }


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this._OrderService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this._OrderService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this._OrderService.remove(+id);
  }
}
