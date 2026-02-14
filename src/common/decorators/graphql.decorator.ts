import { SetMetadata } from "@nestjs/common";


export const IS_GRAPHQL = 'isGraphql';
export const Graphql = () => SetMetadata(IS_GRAPHQL, true); 