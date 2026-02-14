import { Inject, Injectable } from "@nestjs/common";
import { v2 as Cloudinary, UploadApiOptions, UploadApiResponse } from "cloudinary";
import { CLOUDINARY } from "src/common/constants/constants";
import { ImageType } from "src/common/types/image.type";

@Injectable()
export class FileUploadService {
    constructor(@Inject(CLOUDINARY) private cloudinary: typeof Cloudinary) {
        // Constructor logic can be added here if needed
    }

    async uploadCloud(buffer: Buffer, options: UploadApiOptions): Promise<UploadApiResponse> {
        return new Promise((resolve, reject) => {
            this.cloudinary.uploader.upload_stream(options, (error, result) => {
                if (error) {
                    return reject(error);
                } else {
                    return resolve(result!);
                }
            }).end(buffer);
        });
    }
    // Define methods for file upload service here
    // For example, you can add methods for uploading files to Cloudinary or other storage services
    async saveFileToCloud(files: Express.Multer.File[], options: UploadApiOptions) {
        let savedFiles: ImageType[] = [];
        for (const file of files) {
            let buffer = file.buffer;

            const {secure_url, public_id} = await this.uploadCloud(buffer, options);
            savedFiles.push({ secure_url, public_id });
        }
        return savedFiles;
    }

    async deleteFilesFromCloud(publicIds: string[]) {
        const deletePromises = publicIds.map((publicId) => this.cloudinary.uploader.destroy(publicId));
        return Promise.all(deletePromises);
    }

    async deleteFolderFromCloud(folderPath: string) {
        console.log(`Deleting folder: ${folderPath}`);
        await this.cloudinary.api.delete_resources_by_prefix(folderPath);

        const subFolders = await this.cloudinary.api.sub_folders(folderPath);

        if (subFolders.folders.length) {
            for (const subFolder of subFolders.folders) {
                await this.deleteFolderFromCloud(subFolder);
            }
        }

        await this.cloudinary.api.delete_folder(folderPath);
    }
}