import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Types } from 'mongoose';
import { ProductRepository } from 'src/DB/repository/product.repository';
import { CategoryRepository } from 'src/DB/repository/category.repository';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';
import { FileUploadService } from 'src/common/services/fileupload/fileuploud.service';
import { ImageType } from 'src/common/types/image.type';
import { FindProductDto } from './dto/find-product.dto';
import { StockGateway } from '../socket/stock.gateway';

@Injectable()
export class ProductService {
  constructor(
    private readonly _ProductRepository: ProductRepository,
    private readonly _CategoryRepository: CategoryRepository,
    private readonly _FileUploudService: FileUploadService,
    private readonly _ConfigService: ConfigService,
    private readonly _StockGateway: StockGateway
  ) {}

  async create( 
    userId: Types.ObjectId, 
    categoryId: Types.ObjectId, 
    files: Record<string, Express.Multer.File[]>, 
    data: CreateProductDto
  ) {
    const category = await this._CategoryRepository.findOne({
      filter: {_id: categoryId}
    })
    if(!categoryId) throw new NotFoundException("Category is not found!");

    const isProduct = await this._ProductRepository.findOne({ filter: { name: data.name } })

    if (isProduct) throw new NotFoundException(`Product with name ${data.name} already existed!`)

    const cloudFolder = `${this._ConfigService.get("CLOUD_ROOT_FOLDER")}/product/${uuid()}`;

    const [thumbnail] = await this._FileUploudService.saveFileToCloud(
      files.thumbnail,
      {folder: cloudFolder}
    )

    let images: ImageType[] | undefined;

    if (files.images) {
      images = await this._FileUploudService.saveFileToCloud(
        files.images,
        {folder: cloudFolder}
      )
    }

    const product = await this._ProductRepository.create({
      ...data, 
      cloudFolder, 
      createdBy: userId, 
      category: categoryId,
      thumbnail,
      ...(images && {images}),
    })
    

    return { data: product }
  }

  async update(userId: Types.ObjectId, productId: Types.ObjectId, data: UpdateProductDto) {
    const product = await this._ProductRepository.update({
      filter: { _id: productId, createdBy: userId },
      update: { ...data }
    });

    if (!product) throw new NotFoundException("Product not found!");
    await product.save();

    return { data: product };
  }

  async removeImage(userId: Types.ObjectId, productId: Types.ObjectId, secure_url: string) {
    const product = await this._ProductRepository.findOne({
      filter: { _id: productId, createdBy: userId, $or: [
        {'thumbnail.secure_url': secure_url}, 
        {'images.secure_url': secure_url}, 
      ]},
    });

    if (!product) throw new NotFoundException("Product not found or image does not belong to this product!");

    const {thumbnail, images} = product;

    if (thumbnail?.secure_url == secure_url) {
      if (!images?.length) {
        throw new BadRequestException(`Cannot remove the only existed image. Please upload another one first!`)
      }

      await this._FileUploudService.deleteFilesFromCloud([thumbnail.public_id]);

      const lastImage = images[images.length - 1];
      product.thumbnail = lastImage;

      product.images.pop();
    } else {
      const imageToRemove = images?.find((img) => img.secure_url == secure_url);

      await this._FileUploudService.deleteFilesFromCloud([imageToRemove!.public_id])

      product.images = images.filter((img) => img.secure_url != secure_url)
    }

    await product.save();

    return {data: product}
  }

  async addImage(userId: Types.ObjectId, productId: Types.ObjectId, image: Express.Multer.File, isThumbnail: boolean) {
    const product = await this._ProductRepository.findOne({
      filter: { _id: productId, createdBy: userId },
    });

    if (!product) throw new NotFoundException("Product not found or image does not belong to this product!");

    if (!image) throw new BadRequestException("Image is required!")

    if (isThumbnail) {
      const [thumbnail] = await this._FileUploudService.saveFileToCloud([image], {public_id: product.thumbnail.public_id})

      product.thumbnail = thumbnail;
    } else {
      const results = await this._FileUploudService.saveFileToCloud([image], {
        folder: product.cloudFolder
      })

      product.images.push(results[0]);
    }

    await product.save();

    return {data: product}
  }



  async remove(userId: Types.ObjectId, productId: Types.ObjectId) {
    const product = await this._ProductRepository.findOne({
      filter: { _id: productId, createdBy: userId },
    });

    if (!product) throw new NotFoundException("Product not found!");

    await product.deleteOne();
    
    return { message: "Product is deleted." };
  }



  async findAll(Query: FindProductDto) {
    const Products = await this._ProductRepository.findAll({
      filter: {
        ...Query.category && {category: new Types.ObjectId(Query.category)},
        ...Query.K && {name: {
          $or: [
          {name: {$regex: Query.K, $options: 'i'}}, 
          {description: {$regex: Query.K, $options: 'i'}}
        ]
      }},
        ...(Query.price && {
          finalPrice: {
            ...(Query.price.min !== undefined ? {$gte: Query.price.min} : {}),
            ...(Query.price.max !== undefined ? {$lte: Query.price.max} : {}),
          }
        })
      },
      sort: Query.sort ? {[Query.sort.by || 'createdAt']: Query.sort.dir || -1} : {createdAt: -1},
      paginate: {
        page: Query.page || 1,
      }
    });
    return { data: Products };
  }



  findOne(id: number) {
    return `This action returns a #${id} product`;
  }



  async checkProductExistence(productId: Types.ObjectId) {
    const product = await this._ProductRepository.findOne({
      filter: {_id: productId}
    })

    if(!product) {
      throw new NotFoundException('product Not found')
    }

    return product;
  }


  async updateStock(
    productId: Types.ObjectId, 
    quantity: number, 
    increment: boolean
  ) {
    const product = await this._ProductRepository.update({
      filter: {_id: productId}, 
      update: {$inc: {stock: increment? quantity : -quantity}}
    });

    // socket
    this._StockGateway.broadcastStockUpdate(product!._id as Types.ObjectId, product!.stock)

    return product;
  }

}
