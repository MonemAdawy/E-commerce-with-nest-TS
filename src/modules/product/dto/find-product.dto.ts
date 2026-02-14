import { Type } from "class-transformer";
import { IsIn, IsInt, IsMongoId, IsNumber, IsOptional, IsPositive, IsString, Min, ValidateNested } from "class-validator";
import { Types } from "mongoose";


class PriceDto {
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    min?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    max?: number;
}

class SortDto {
    @IsOptional()
    @IsString()
    by?: string;

    @IsOptional()
    @Type(() => Number)
    @IsIn([-1, 1])
    dir?: -1 | 1;
}

export class FindProductDto {
    @IsOptional()
    @IsMongoId()
    category?: Types.ObjectId;

    @IsOptional()
    @IsString()
    K?: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => PriceDto)
    price?: PriceDto;

    @IsOptional()
    @ValidateNested()
    @Type(() => SortDto)
    sort?: SortDto;

    @IsOptional()
    @IsInt()
    @Min(1)
    @IsPositive()
    @Type(() => Number)
    page?: number;
}