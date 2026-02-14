import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";

export const User = createParamDecorator(
    (data: string, ctx: ExecutionContext) => {
    const gqlctx = GqlExecutionContext.create(ctx).getContext();
    const {user} = gqlctx.req;
    return data ? user?.[data] : user;
});