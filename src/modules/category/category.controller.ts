import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseInterceptors, UploadedFile, Query, ParseIntPipe } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Role } from 'src/common/decorators/roles.decorator';
import { Roles } from 'src/DB/enums/user.enum';
import { User } from 'src/common/decorators/user.decorator';
import { Types } from 'mongoose';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('category')
@Role(Roles.admin)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post('create')
  @Role(Roles.admin)
  @UseInterceptors(FileInterceptor('image'))
  create(@Body() data: CreateCategoryDto, @User('_id') userId: Types.ObjectId, @UploadedFile() file: Express.Multer.File) {
    return this.categoryService.create(data, userId, file);
  }

  @Role(Roles.admin)
  @Patch(':id')
  async update(@Param('id', ParseObjectIdPipe) categoryId: Types.ObjectId, @Body() updateCategoryDto: UpdateCategoryDto, @User('_id') userId: Types.ObjectId) {
    return this.categoryService.update(categoryId, updateCategoryDto, userId);
  }

  @Role(Roles.admin)
  @Patch(':id/image')
  @UseInterceptors(FileInterceptor('image'))
  async updateImage(@Param('id', ParseObjectIdPipe) categoryId: Types.ObjectId, @User('_id') userId: Types.ObjectId, @UploadedFile() file: Express.Multer.File) {
    return this.categoryService.updateImage(categoryId, userId, file);
  }

  @Role(Roles.admin)
  @Delete(':id/remove')
  async remove(@Param('id', ParseObjectIdPipe) categoryId: Types.ObjectId, @User('_id') userId: Types.ObjectId) {
    return this.categoryService.remove(categoryId, userId);
  }

  @Public()
  @Get(':id/get-one')
  async findOne(@Param('id', ParseObjectIdPipe) categoryId: Types.ObjectId,) {
    return this.categoryService.findOne(categoryId);
  }

  @Public()
  @Get('get-all')
  async findAll(@Query('page', ParseIntPipe) page: number) {
    return this.categoryService.findAll(page);
  }
}
