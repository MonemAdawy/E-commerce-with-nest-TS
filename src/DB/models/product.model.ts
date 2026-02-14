import { Document, HydratedDocument, Types } from "mongoose";
import { MongooseModule, Prop, raw, Schema, SchemaFactory } from "@nestjs/mongoose";
import { UserModelName } from "./user.model";
import { ImageType } from "src/common/types/image.type";
import slugify from "slugify";
import { FileUploadService } from "src/common/services/fileupload/fileuploud.service";
import { ConfigService } from "@nestjs/config";
import { FileUploadModule } from "src/common/services/fileupload/fileuploud.module";
import { CategoryModelName } from "./category.model";

@Schema({timestamps: true})
export class Product extends Document {
    @Prop({
        type: String, 
        required: true, 
        unique: true, 
        index: {name: "Product_name_index"},
        set: function (value: string) {
            this.slug = slugify(value);
            return value;
        }
    })
    name: string;

    @Prop({type: String})
    slug: string;

    @Prop(raw({secure_url: String, public_id: String}))
    thumbnail: ImageType;

    @Prop({type: [raw({secure_url: String, public_id: String})]})
    images: ImageType[];

    @Prop({type: String})
    cloudFolder: string; 

    @Prop({type: Types.ObjectId, ref: UserModelName, required: true})
    createdBy: Types.ObjectId;

    @Prop({type: Types.ObjectId, required: true, ref: CategoryModelName})
    category: Types.ObjectId;

    @Prop({type: Number, required: true, min: 1})
    stock: number;

    @Prop({
        type: Number, 
        required: true,
    })
    price: number;

    @Prop({
        type: Number, 
        min: 0, 
        max: 100,
    })
    discount: number; // %

    @Prop({
        type: Number, 
        default: function() {
            return this.price - (this.price * this.discount || 0) / 100;
        },
    })
    finalPrice: number;

    @Prop({type: Number, min: 1, max: 5})
    ratings: number;
}

export const productSchema = SchemaFactory.createForClass(Product);

export const productModelName = Product.name;

export const productModel = MongooseModule.forFeatureAsync([{
    name: productModelName, 
    useFactory: (fileUploadService: FileUploadService, configService: ConfigService) =>{

        productSchema.pre('findOneAndUpdate', async function(next) {
            const update = this.getUpdate() as any;
            if (update.name) {
                update.slug = slugify(update.name);
            }
            if (update.price || update.discount) {
                update.finalPrice = update.price - (update.price * (update.discount || 0)) / 100;
            }
            next();
        });

        productSchema.post('deleteOne', {document: true, query: false}, async function(doc) {
            await fileUploadService.deleteFolderFromCloud(doc.cloudFolder);
        });
        return productSchema;
    },
    inject: [FileUploadService, ConfigService],
    imports: [FileUploadModule],
}]);



export type ProductDocument = HydratedDocument<Product>;