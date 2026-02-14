import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFiles, UploadedFile, Query, ParseBoolPipe, ParseIntPipe } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Role } from 'src/common/decorators/roles.decorator';
import { Roles } from 'src/DB/enums/user.enum';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { User } from 'src/common/decorators/user.decorator';
import { Types } from 'mongoose';
import { ThumbnailRequiredPipe } from './pipes/required-thumbnail.pipe';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { RemoveImageDto } from './dto/remove-image.dto';
import { FindProductDto } from './dto/find-product.dto';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('create/:categoryId')
  @Role(Roles.seller)
  @UseInterceptors(FileFieldsInterceptor([{name: "thumbnail", maxCount: 1}, {name: "images", maxCount: 5}]))
  create(
    @User('_id') userId: Types.ObjectId,
    @Param('categoryId', ParseObjectIdPipe) categoryId: Types.ObjectId,
    @UploadedFiles(ThumbnailRequiredPipe) files: Record<string, Express.Multer.File[]>,
    @Body() data: CreateProductDto
  ) {
    console.log('Validated DTO:', data);
    return this.productService.create(userId, categoryId, files, data);
  }

  @Patch(':productId')
  @Role(Roles.seller)
  async update(
    @User('_id') userId: Types.ObjectId,
    @Param('productId', ParseObjectIdPipe) productId: Types.ObjectId, 
    @Body() data: UpdateProductDto
  ) {
    return this.productService.update(userId, productId, data);
  }

  @Patch(':productId/remove-image')
  @Role(Roles.seller)
  async removeImage(
    @User('_id') userId: Types.ObjectId,
    @Param('productId', ParseObjectIdPipe) productId: Types.ObjectId, 
    @Body() data: RemoveImageDto
  ) {
    return this.productService.removeImage(userId, productId, data.secure_url);
  }


  @Patch(':productId/add-image')
  @UseInterceptors(FileInterceptor('image'))
  @Role(Roles.seller)
  async addImage(
    @User('_id') userId: Types.ObjectId,
    @Param('productId', ParseObjectIdPipe) productId: Types.ObjectId, 
    @UploadedFile() image: Express.Multer.File,
    @Query('isThumbnail', ParseBoolPipe) isThumbnail: boolean,
  ) {
    return this.productService.addImage(userId, productId, image, isThumbnail);
  }

  @Delete(':productId')
  @Role(Roles.seller, Roles.admin)
  async delete(
    @User('_id') userId: Types.ObjectId,
    @Param('productId', ParseObjectIdPipe) productId: Types.ObjectId
  ) {
    return this.productService.remove(userId, productId);
  }


  @Public()
  @Get('get-all')
  async findAll(@Query() data : FindProductDto) {
    return this.productService.findAll(data);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(+id);
  }

  

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.productService.remove(+id);
  // }
}
