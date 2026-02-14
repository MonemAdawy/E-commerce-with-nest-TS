import { Injectable } from "@nestjs/common";
import { AbstractRepository } from "./abstract.repository";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { OrderDocument, OrderModelName } from "../models/order.model";

@Injectable()
export class OrderRepository extends AbstractRepository<OrderDocument> {
    constructor(@InjectModel(OrderModelName) Order: Model<OrderDocument>) {
        super(Order);
    }
}
