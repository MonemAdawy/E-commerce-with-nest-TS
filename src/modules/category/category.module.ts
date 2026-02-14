import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { CategoryRepository } from 'src/DB/repository/category.repository';
import { FileUploadService } from 'src/common/services/fileupload/fileuploud.service';
import { CategoryModel } from 'src/DB/models/category.model';
import { CloudinaryProvider } from 'src/common/services/fileupload/cloudinarey.provider';

@Module({
  imports: [CategoryModel],
  controllers: [CategoryController],
  providers: [CategoryService, CategoryRepository, FileUploadService, CloudinaryProvider],
  exports: [CategoryRepository]
})
export class CategoryModule {}
