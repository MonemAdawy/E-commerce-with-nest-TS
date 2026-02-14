import { Args, Query, Resolver } from '@nestjs/graphql';
import { OrderService } from './order.service';
import { AllOrderResponse } from './entities/order.entity';
import { Graphql } from 'src/common/decorators/graphql.decorator';
import { User } from 'src/common/decorators/user-graphql.decorator';
import { Role } from 'src/common/decorators/roles.decorator';
import { Roles } from 'src/DB/enums/user.enum';
import { Types } from 'mongoose';
import { PaginateInput } from 'src/common/graphql/inputs/paginate.input';


@Resolver()
export class OrderResolver {
    constructor(
        private readonly _OrderService: OrderService
    ) {}

    @Graphql()
    @Role(Roles.user)
    // @SkipInterceptor()
    @Query(()=> AllOrderResponse)
    async allOrders(
        @User('_id') userId: Types.ObjectId,
        @Args('paginate', {nullable: true}) paginate: PaginateInput
    ) {
        return this._OrderService.allOrders(userId, paginate)
    }
}
