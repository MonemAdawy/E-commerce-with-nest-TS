import { Document, HydratedDocument } from "mongoose";
import { Roles } from "../enums/user.enum";
import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { hash } from "src/common/security/hash.util";

@Schema({timestamps: true})
export class User extends Document {
    @Prop({type: String, required: true})
    firstName: string;

    @Prop({type: String, required: true})
    lastName: string;

    @Prop({type: String, required: true, unique: true, lowercase: true})
    email: string;

    @Prop({type: String, required: true})
    password: string;

    @Prop({type: Boolean, default: false})
    accountActivated: boolean;

    @Prop({type: String, default: Roles.user})
    role: Roles;

    @Prop({type: String, required: true})
    otp: string;
}




export const UserSchema = SchemaFactory.createForClass(User);


UserSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await hash(this.password);
    }
    return next();
});


export const UserModelName = User.name;

export const UserModel = MongooseModule.forFeature([{name: UserModelName, schema: UserSchema}]);


export type UserDocument = HydratedDocument<User>;