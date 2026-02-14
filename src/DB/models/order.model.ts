import { Document, HydratedDocument, Types } from "mongoose";
import { MongooseModule, Prop, raw, Schema, SchemaFactory } from "@nestjs/mongoose";
import { UserModelName } from "./user.model";
import { ImageType } from "src/common/types/image.type";
import { CartModelName } from "./cart.model";


export enum OrderStatus {
    placed= 'placed',
    shipped= 'shipped',
    onway= 'onway',
    delivered= 'delivered',
    canceled= 'canceled',
    refunded= 'refunded'
}


export enum PaymentMethod {
    card= 'card',
    cash= 'cash'
}

@Schema({timestamps: true})
export class Order extends Document {
    @Prop({type: Types.ObjectId, required: true, ref: UserModelName})
    user: Types.ObjectId;

    @Prop({type: Types.ObjectId, required: true, ref: CartModelName})
    cart: Types.ObjectId;

    @Prop({type: String, required: true})
    phone: string;

    @Prop({type: String, required: true})
    address: string

    @Prop({type: String, default: OrderStatus.placed, enum: Object(OrderStatus)})
    orderStatus: OrderStatus

    @Prop({type: Number, required: true})
    price: number;

    @Prop({type: String, enum: Object.values(PaymentMethod), default: PaymentMethod.cash})
    paymentMethod:PaymentMethod;

    @Prop({type: {secure_url: String, public_id: String}})
    invoice: ImageType;

    @Prop({type: Boolean, default: false})
    paid: boolean;

    @Prop({type: String})
    payment_intent: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

export const OrderModelName = Order.name;

export const OrderModel = MongooseModule.forFeature([{name: OrderModelName, schema: OrderSchema}]);

export type OrderDocument = HydratedDocument<Order>;