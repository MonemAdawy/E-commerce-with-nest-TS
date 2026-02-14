import { Injectable } from "@nestjs/common";
import { AbstractRepository } from "./abstract.repository";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { TokenDocument, TokenModelName } from "../models/token.model";

@Injectable()
export class TokenRepository extends AbstractRepository<TokenDocument> {
    constructor(@InjectModel(TokenModelName) Token: Model<TokenDocument>) {
        super(Token);
    }
}