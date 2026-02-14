import { Injectable } from "@nestjs/common";
import { AbstractRepository } from "./abstract.repository";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ProductDocument, productModel, productModelName } from "../models/product.model";

@Injectable()
export class ProductRepository extends AbstractRepository<ProductDocument> {
    constructor(@InjectModel(productModelName) Product: Model<ProductDocument>) {
        super(Product);
    }

    
}
