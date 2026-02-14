import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { TokenRepository } from "src/DB/repository/token.repository";
import { UserRepository } from "src/DB/repository/user.repository";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import { IS_GRAPHQL } from "../decorators/graphql.decorator";
import { GqlExecutionContext } from "@nestjs/graphql";



@Injectable()
export class AuthenticationGuard implements CanActivate {
    constructor(
        private readonly _JwtService: JwtService,
        private readonly _ConfigService: ConfigService,
        private readonly _UserRepository: UserRepository,
        private readonly _TokenRepository: TokenRepository,
        private readonly reflector: Reflector,
    ) {}


    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass()
        ]);

        if (isPublic) return true;

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



        const token = this.extractTokenFromHeaders(request);
        if(!token) throw new UnauthorizedException();

        try {
            const payload = this._JwtService.verify(token, {
                secret: this._ConfigService.get("JWT_SECRET")
            })

            const user = await this._UserRepository.findOne({filter: {_id: payload.id}});
            // console.log('Authenticated User:', user);

            if (!user) throw new UnauthorizedException('Invalid token');

            const tokenDoc = await this._TokenRepository.findOne({filter: {token, user: user._id, isValid: true}});

            if (!tokenDoc) throw new UnauthorizedException('Invalid token');

            request.user = user;
        } catch(error) {
            new UnauthorizedException('Invalid token');
        }
        console.log('Authentication guard passed');
        return true;
    }

    private extractTokenFromHeaders(request: Request) {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];

        return type == "Bearer" ? token : undefined;
    }
}