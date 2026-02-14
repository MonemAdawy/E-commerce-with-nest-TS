import { Module } from "@nestjs/common";
import { FileUploadService } from "./fileuploud.service";
import { ConfigService } from "@nestjs/config";
import { CloudinaryProvider } from "./cloudinarey.provider";

@Module({
    imports: [],
    controllers: [],
    providers: [FileUploadService, CloudinaryProvider, ConfigService],
    exports: [FileUploadService, CloudinaryProvider],
})
export class FileUploadModule {}