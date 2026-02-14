import { Injectable } from "@nestjs/common";
import { AbstractRepository } from "./abstract.repository";
import { UserDocument, UserModelName } from "../models/user.model";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class UserRepository extends AbstractRepository<UserDocument> {
    constructor(@InjectModel(UserModelName) User: Model<UserDocument>) {
        super(User);
    }
}