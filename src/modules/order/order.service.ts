import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UserDocument } from 'src/DB/models/user.model';
import { OrderRepository } from 'src/DB/repository/order.repository';
import { CartService } from '../cart/cart.service';
import { Types } from 'mongoose';
import { ProductService } from '../product/product.service';
import { OrderStatus, PaymentMethod } from 'src/DB/models/order.model';
import { PaymentService } from 'src/common/services/payment/payment.service';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { PaginateInput } from 'src/common/graphql/inputs/Paginate.input';

@Injectable()
export class OrderService {
  constructor(
    private readonly _OrderRepository: OrderRepository,
    private readonly _CartService: CartService,
    private readonly _ProductService: ProductService,
    private readonly _PaymentService: PaymentService,
    @Inject(CACHE_MANAGER) private _CacheManger: Cache
  ) {}

  async create(data: CreateOrderDto, user: UserDocument) {
    const userId = user._id as Types.ObjectId;

    const cart = await this._CartService.getCart(userId);

    if(!cart || !cart.products.length) {
      throw new BadRequestException("Empty Cart")
    }

    let price = 0;
    let products: any = [];

    for (const prd of cart.products) {
      const product = await this._ProductService.checkProductExistence(prd.product);

      if (product!.stock < prd.quantity){
        throw new NotFoundException('Insufficient stock');
      }
      price += prd.price;
      products.push({
        name: product.name,
        price: product.finalPrice,
        quantity: prd.quantity,
        image: product.thumbnail?.secure_url,
      })
    }


    const order = await this._OrderRepository.create({
      ...data,
      cart: cart._id as Types.ObjectId,
      user: userId,
      price
    })


    if (order.paymentMethod == PaymentMethod.cash) {
      const products = cart.products;

      for (const prd of products) {
        const product = await this._ProductService.updateStock(
          prd.product, 
          prd.quantity, 
          false
        );

        await this._CartService.clearCart(userId);
        return {message: 'done'}
      }
    }

    const session = await this.payWithCard(order.id, products, user.email)

    await this._CartService.clearCart(userId);

    return {message: 'done', data: session};
  }

  async payWithCard(orderId, products, userEmail) {
    const line_items = products.map((product)=> ({
      price_data: {
        currency: "egp",
        product_data: {
          name: product.name,
          images: [product.image]
        },
        unit_amount: product.price * 100,
      },
      quantity: product.quantity,
    }))

    const {id} = await this._PaymentService.createCoupon({
      currency: 'egp', 
      percent_off: 20
    })

    return await this._PaymentService.createCheckoutSession({
      metadata: {orderId},
      customer_email: userEmail,
      line_items,
      discounts: [{
        coupon: id,
      }]
    })
  }

  async stripWebhook(info: any) {
    const {orderId} = info.data.object.metadata

    const order = await this._OrderRepository.update({
      filter: {
        _id: Types.ObjectId.createFromHexString(orderId),
        paid: false,
        paymentMethod: PaymentMethod.card
      },
      update: {
        paid: true,
        payment_intent: info.data.object.payment_intent,
      }
    })

    await this._CartService.clearCart(order!.user)
  }

  async cancelOrder(orderId: Types.ObjectId, userId: Types.ObjectId) {
    const order = await this._OrderRepository.findOne({
      filter: {_id: orderId, user: userId}
    });

    if(!order) throw new NotFoundException('order not Found!');

    const paymentIntent = order.payment_intent;
    
    if (order.paymentMethod == PaymentMethod.card) {
      await this._PaymentService.refund(paymentIntent);
      order.orderStatus = OrderStatus.refunded;
    }

    order.orderStatus = OrderStatus.canceled;
    await order.save()

    return {message: 'Done'}
  }


  async testRedis() {
    await this._CacheManger.set('abdo', 'adawy');

    const result = await this._CacheManger.get('abdo');

    return {data: result};
  }

  async allOrders(userId: Types.ObjectId, paginate: PaginateInput) {
    return this._OrderRepository.findAll({
      filter: {
        user: userId
      },
      populate: 'user',
      paginate
    })  
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
