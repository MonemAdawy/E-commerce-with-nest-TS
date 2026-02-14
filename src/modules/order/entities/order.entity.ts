import { Field, Float, ID, Int, ObjectType } from "@nestjs/graphql";
import { Types } from "mongoose";
import { OrderStatus, PaymentMethod } from "src/DB/models/order.model";


@ObjectType()
export class PaginateResponse {
    @Field(()=> Int)
    totalSize: number;

    @Field(()=> Int)
    totalPages: number;

    @Field(()=> Int)
    pageSize: number;

    @Field(()=> Int)
    pageNumber: number;
}


@ObjectType()
export class AllOrderResponse extends PaginateResponse {
    @Field(()=> [OneOrderResponse])
    data: OneOrderResponse[]
}


@ObjectType()
export class OneUserResponse {
    @Field(()=> ID)
    _id: Types.ObjectId;

    @Field(()=> String)
    firstName: string

    @Field(()=> String)
    lastName: string


}


@ObjectType()
export class OneOrderResponse {
    @Field(()=> ID)
    _id: Types.ObjectId;

    @Field(()=> OneUserResponse)
    user: OneUserResponse;

    @Field(()=> String)
    phone: string

    @Field(()=> String)
    address: string

    @Field(()=> String)
    orderStatus: OrderStatus;

    @Field(()=> Float)
    price: number;

    @Field(()=> String)
    paymentMethod: PaymentMethod;

    @Field(()=> Boolean)
    paid: boolean
}