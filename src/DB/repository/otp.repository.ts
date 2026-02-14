import { Injectable } from "@nestjs/common";
import { AbstractRepository } from "./abstract.repository";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { OtpDocument, OtpModelName } from "../models/otp.model";

@Injectable()
export class OtpRepository extends AbstractRepository<OtpDocument> {
    constructor(@InjectModel(OtpModelName) Otp: Model<OtpDocument>) {
        super(Otp);
    }
}