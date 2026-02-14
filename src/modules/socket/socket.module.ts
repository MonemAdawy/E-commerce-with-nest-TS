import { Module } from "@nestjs/common";
import { StockGateway } from "./stock.gateway";
import { JwtModule } from "@nestjs/jwt";
import { UserModule } from "../user/user.module";
import { UserRepository } from "src/DB/repository/user.repository";
import { TokenRepository } from "src/DB/repository/token.repository";
import { UserModel } from "src/DB/models/user.model";
import { TokenModel } from "src/DB/models/token.model";

@Module({
    providers: [StockGateway, UserRepository, TokenRepository],
    imports: [JwtModule, UserModule, UserModel, TokenModel],
    exports: [StockGateway]
})
export class SocketModule {}