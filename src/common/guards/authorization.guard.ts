import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { GqlExecutionContext } from '@nestjs/graphql';
import { IS_GRAPHQL } from '../decorators/graphql.decorator';

@Injectable()
export class AuthorizationGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
        ]);

        if (isPublic) return true;



        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles || requiredRoles.length === 0) {
            throw new ForbiddenException('Access denied: No roles defined');
        }

        let request;
        const isGraphql = this.reflector.getAllAndOverride(IS_GRAPHQL, [
            context.getHandler(),
            context.getClass()
        ])
        
        if (isGraphql) {
            const ctx = GqlExecutionContext.create(context).getContext()
            request = ctx.req;
        } else {
            request = context.switchToHttp().getRequest();
        }


        const user = request.user;
        if (!user || !user.role) {
            throw new ForbiddenException('Access denied: User not authenticated or role missing');
        }

        const hasRole = requiredRoles.includes(user?.role);
        if (!hasRole) {
            throw new ForbiddenException('Access denied: Insufficient permissions');
        }
        console.log('authorization guard passed');
        return true;
    }
}