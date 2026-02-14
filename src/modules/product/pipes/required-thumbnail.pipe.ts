import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from "@nestjs/common";

@Injectable()
export class ThumbnailRequiredPipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata) {
        if (!value || !value.thumbnail) throw new BadRequestException("Thembnail is required")
        console.log("successfully validated thumbnail");
        return value
    }
}