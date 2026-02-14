import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { map, Observable, tap } from "rxjs";
import { SKIP_INTERCEPTOR } from "../decorators/skip-interceptor.decorator";
import { IS_GRAPHQL } from "../decorators/graphql.decorator";

@Injectable()
export class ResponseMappingInterceptor implements NestInterceptor {
    constructor(private readonly reflector: Reflector) {}

    intercept(
        context: ExecutionContext, 
        next: CallHandler<any>
    ): Observable<any> {
        const isGraphql = this.reflector.getAllAndOverride(IS_GRAPHQL, [
            context.getHandler(),
            context.getClass()
        ])

        console.log('isGraphql',isGraphql)

        if (isGraphql) {
            return next.handle();
        }

        return next.handle().pipe(
            tap((res) => console.log('Response before edit: ', res)),
            map((res) => ({
                success: true,
                time: new Date(),
                data: res?.data || [],
                message: res?.message || "",
            })),
            tap((res) => console.log('Response after edit: ', res)),
        );
    }
}
