import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description: string;

    @IsNumber()
    @Min(1)
    @Type(() => Number)
    price: number;

    @IsNumber()
    @Min(0)
    @Max(100)
    @IsOptional()
    @Type(() => Number)
    discount: number;


    @IsNumber()
    @Min(1)
    @IsInt()
    @Type(() => Number)
    stock: number;

    // categoryId: string;

    
    // createdBy: string; // User ID of the creator
    
    
    // updatedBy?: string; // User ID of the last updater
}
