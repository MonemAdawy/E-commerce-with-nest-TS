import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { ProductRepository } from 'src/DB/repository/product.repository';
import { productModel } from 'src/DB/models/product.model';
import { CategoryRepository } from 'src/DB/repository/category.repository';
import { ConfigService } from '@nestjs/config';
import { FileUploadService } from 'src/common/services/fileupload/fileuploud.service';
import { CategoryModule } from '../category/category.module';
import { FileUploadModule } from 'src/common/services/fileupload/fileuploud.module';
import { SocketModule } from '../socket/socket.module';

@Module({
  controllers: [ProductController],
  providers: [
    ProductService, 
    ProductRepository, 
    // FileUploadService, 
    // ConfigService
  ],
  imports: [productModel, CategoryModule, FileUploadModule, SocketModule],
  exports: [ProductService, ProductRepository, productModel]
})
export class ProductModule {}
