import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Types } from 'mongoose';
import { FileUploadService } from 'src/common/services/fileupload/fileuploud.service';
import { ConfigService } from '@nestjs/config';
import { CategoryRepository } from 'src/DB/repository/category.repository';
import { v4 as uuidv4 } from 'uuid';
// import * as nanoid from 'nanoid';

@Injectable()
export class CategoryService {
  constructor(
    private readonly _FileUploadService: FileUploadService,
    private readonly _ConfigService: ConfigService,
    private readonly _CategoryRepository: CategoryRepository,
  ) {}


  async create(createCategoryDto: CreateCategoryDto, userId: Types.ObjectId, file: Express.Multer.File) {
    const rootFolder = this._ConfigService.get('CLOUD_ROOT_FOLDER');
    const cloudFolder = uuidv4(); 
    const results = await this._FileUploadService.saveFileToCloud([file],{ folder: `${rootFolder}/category/${cloudFolder}` });

    if (!results || results.length === 0) {
      throw new Error('File upload failed'); // Handle the case where no files are uploaded
    }
    
    const category = await this._CategoryRepository.create({
      ...createCategoryDto,
      cloudFolder,
      image: results[0],
      createdBy: userId,
    });

    return { data: category };
  }


  async update(categoryId: Types.ObjectId, updateCategoryDto: UpdateCategoryDto, userId: Types.ObjectId) {
    
    const category = await this._CategoryRepository.findOne({filter: {_id: categoryId}});
    if (!category) {
      throw new NotFoundException('Category not found'); // Handle the case where the category is not found
    }

    if (updateCategoryDto.name) {
      category.name = updateCategoryDto.name;
      category.updatedBy = userId;
      await category.save();
    }

    return { data: category };

  }


  



  async updateImage(categoryId: Types.ObjectId, userId: Types.ObjectId, file: Express.Multer.File) {
    // const rootFolder = this._ConfigService.get('CLOUD_ROOT_FOLDER');
    // const cloudFolder = uuidv4();


    const category = await this._CategoryRepository.findOne({filter: {_id: categoryId}});
    if (!category) {
      throw new NotFoundException('Category not found'); // Handle the case where the category is not found
    }

    const publicId = category.image.public_id;
    const results = await this._FileUploadService.saveFileToCloud([file], {publicId});


    category.image = results[0];
    category.updatedBy = userId;
    await category.save();

    return { data: category };
  }

  async remove(categoryId: Types.ObjectId, userId: Types.ObjectId) {
    const category = await this._CategoryRepository.findOne({filter: {_id: categoryId}});
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    await category.deleteOne()

    return { message: 'Category deleted successfully' };
  }


  async findOne(categoryId: Types.ObjectId) {
    const category = await this._CategoryRepository.findOne({filter: {_id: categoryId}});
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return { data: category };
  }


  async findAll(page: number) {
    const categories = await this._CategoryRepository.findAll({filter: {}, populate: [{path: 'createdBy'}], paginate: {page}});
    if (!categories || categories.length === 0) {
      throw new NotFoundException('No categories found');
    }
    return { data: categories };
  }

}
