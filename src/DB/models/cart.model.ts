import { Document, HydratedDocument, Types } from "mongoose";
import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { hash } from "src/common/security/hash.util";
import { UserModelName } from "./user.model";
import { productModelName } from "./product.model";

@Schema({timestamps: true})
export class Cart extends Document {
    @Prop({type: Types.ObjectId, required: true, ref: UserModelName})
    user: Types.ObjectId;

    @Prop({type: [{product: {type: Types.ObjectId, ref: productModelName}, quantity: {type: Number, default: 1}, price: {type: Number}}]})
    products: {
        product: Types.ObjectId;
        quantity: number;
        price: number;
    }[];
}

export const CartSchema = SchemaFactory.createForClass(Cart);

export const CartModelName = Cart.name;

export const CartModel = MongooseModule.forFeature([
    {name: CartModelName, schema: CartSchema}
]);


export type CartDocument = HydratedDocument<Cart>;



