import { Document, HydratedDocument, Types } from "mongoose";
import { MongooseModule, Prop, raw, Schema, SchemaFactory } from "@nestjs/mongoose";
import { UserModelName } from "./user.model";
import { ImageType } from "src/common/types/image.type";
import slugify from "slugify";
import { FileUploadService } from "src/common/services/fileupload/fileuploud.service";
import { ConfigService } from "@nestjs/config";
import { FileUploadModule } from "src/common/services/fileupload/fileuploud.module";

@Schema({timestamps: true})
export class Category extends Document {
    @Prop({type: String, required: true, unique: true, index: {name: "category_name_index"}})
    name: string;

    @Prop({type: String, unique: true})
    slug: string;

    @Prop(raw({secure_url: String, public_id: String}))
    image: ImageType;

    @Prop({type: String})
    cloudFolder: string; 

    @Prop({type: Types.ObjectId, ref: UserModelName, required: true})
    createdBy: Types.ObjectId;

    @Prop({type: Types.ObjectId, ref: UserModelName})
    updatedBy: Types.ObjectId;
}




export const CategorySchema = SchemaFactory.createForClass(Category);


// CategorySchema.pre('save', async function(next) {
//     if (this.isModified('name')) {
//         this.slug = slugify(this.name);
//     }
//     return next();
// });

// CategorySchema.pre('save', async function (next) {
//     if (this.isModified('name')) {
//       console.log('Generating slug for name:', this.name); // Debugging log
//       this.slug = slugify(this.name, { lower: true, strict: true });
//     }
//     next();
// });

// CategorySchema.post('deleteOne', {document: true, query: false}, async function(doc) {
//     const categoryFolder = doc.cloudFolder;
//     if (doc.image && doc.image.public_id) {
//         // Assuming you have a method to delete the image from your storage
//         // await deleteImageFromStorage(doc.image.public_id);
//         console.log(`Image with public_id ${doc.image.public_id} deleted from storage.`);
//     }
// });


export const CategoryModelName = Category.name;

// export const CategoryModel = MongooseModule.forFeature([{name: CategoryModelName, schema: CategorySchema}]);

export const CategoryModel = MongooseModule.forFeatureAsync([{
    name: CategoryModelName, 
    useFactory: (fileUploadService: FileUploadService, configService: ConfigService) =>{
        CategorySchema.pre('save', async function(next) {
            if (this.isModified('name')) {
                this.slug = slugify(this.name);
            }
            return next();
        });
        
        // CategorySchema.pre('save', async function (next) {
        //     if (this.isModified('name')) {
        //       console.log('Generating slug for name:', this.name); // Debugging log
        //       this.slug = slugify(this.name, { lower: true, strict: true });
        //     }
        //     next();
        // });
        
        CategorySchema.post('deleteOne', {document: true, query: false}, async function(doc) {
            console.log('Deleting category:', doc); // Debugging log
            const categoryFolder = doc.cloudFolder;
            console.log('Deleting folder:', categoryFolder); // Debugging log
            const rootFolder = configService.get('CLOUD_ROOT_FOLDER');
            console.log('Root folder:', rootFolder); // Debugging log
            await fileUploadService.deleteFolderFromCloud(`${rootFolder}/category/${categoryFolder}`);
        });

        return CategorySchema;
    },
    inject: [FileUploadService, ConfigService],
    imports: [FileUploadModule],
}]);

export type CategoryDocument = HydratedDocument<Category>;