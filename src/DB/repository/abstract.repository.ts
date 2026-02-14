import { FilterQuery, Model, UpdateQuery } from "mongoose";


export interface Ipaginate {
    page: number;
}

export type finderOneArg<TDocument> = {
    filter: FilterQuery<TDocument>;
    populate?: any;
    select?: string;
};

export type findersArg<TDocument> = finderOneArg<TDocument> & {
    paginate?: Ipaginate;
    sort?: any;
};


export type updateArgs<TDocument> = {
    filter: FilterQuery<TDocument>;
    update: UpdateQuery<TDocument>;
    populate?: any;
    select?: string;
};


export abstract class AbstractRepository<TDocument> {
    protected constructor(private readonly model: Model<TDocument>) {}

    async create(document: Partial<TDocument>): Promise<TDocument> {
        const doc = await this.model.create({...document});
        return doc;
    }


    async findAll({filter = {}, populate, select, paginate, sort}: findersArg<TDocument>) : Promise<TDocument[] | any> {
        let query = this.model.find(filter);
        if (select) query = query.select(select);
        if (populate) query = query.populate(populate);
        if (sort) query = query.sort(sort);

            const { page } = paginate?.page ? paginate : { page: 1 };
            const limit = 2;
            const skip = (page - 1) * limit;
            const totalSize = await query.model.countDocuments(query.getQuery());
            const data = await query.skip(skip).limit(limit).exec();

            return {
                totalSize,
                totalPages: Math.ceil(totalSize / limit),
                pageSize: data.length,
                pageNumber: page,
                data,
            };
    }
    
    async findOne({filter = {}, populate, select}: finderOneArg<TDocument>): Promise<TDocument | null> {
        let query = this.model.findOne(filter);
        if (select) query = query.select(select);
        if (populate) query = query.populate(populate);

        return query.exec();
    }

    async update({filter, update, populate, select}: updateArgs<TDocument>): Promise<TDocument | null> {
        let query = this.model.findOneAndUpdate(filter, update, {new: true, runValidators: true});
        if (select) query = query.select(select);
        if (populate) query = query.populate(populate);

        return query.exec();
    }
    
    
    async delete(filter: FilterQuery<TDocument>) : Promise<TDocument[] | any> {
        let query = this.model.findOneAndDelete(filter);
        return query.exec();
    }
}