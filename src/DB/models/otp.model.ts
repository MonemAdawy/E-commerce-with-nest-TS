import { Document, HydratedDocument } from "mongoose";
import { Roles } from "../enums/user.enum";
import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { hash } from "src/common/security/hash.util";

@Schema({timestamps: true})
export class Otp extends Document {
    @Prop({type: String, required: true, unique: true, lowercase: true})
    email: string;

    @Prop({type: String, required: true})
    otp: string;
}




export const OtpSchema = SchemaFactory.createForClass(Otp);


OtpSchema.index({createdAt: 1}, {expireAfterSeconds: 120});


OtpSchema.pre('save', async function(next) {
    if (this.isModified('otp')) {
        this.otp = await hash(this.otp);
    }
    return next();
});


export const OtpModelName = Otp.name;

export const OtpModel = MongooseModule.forFeature([{name: OtpModelName, schema: OtpSchema}]);


export type OtpDocument = HydratedDocument<Otp>;