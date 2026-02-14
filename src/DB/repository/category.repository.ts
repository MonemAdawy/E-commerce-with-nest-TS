import { Injectable } from "@nestjs/common";
import { AbstractRepository } from "./abstract.repository";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CategoryDocument, CategoryModel, CategoryModelName } from "../models/category.model";

@Injectable()
export class CategoryRepository extends AbstractRepository<CategoryDocument> {
    constructor(@InjectModel(CategoryModelName) Category: Model<CategoryDocument>) {
        super(Category);
    }

    
}
