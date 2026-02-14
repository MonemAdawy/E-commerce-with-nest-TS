import { Injectable } from "@nestjs/common";
import { AbstractRepository } from "./abstract.repository";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CartDocument, CartModel, CartModelName } from "../models/cart.model";

@Injectable()
export class CartRepository extends AbstractRepository<CartDocument> {
    constructor(@InjectModel(CartModelName) Cart: Model<CartDocument>) {
        super(Cart);
    }

    
}
