import { NotFoundException, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Types } from "mongoose";
import { NotFoundError } from "rxjs";
import { Server, Socket } from "socket.io";
import { TokenRepository } from "src/DB/repository/token.repository";
import { UserRepository } from "src/DB/repository/user.repository";


@WebSocketGateway({
    cors: {
        origin: '*',
    }
})
export class StockGateway implements OnGatewayConnection, OnGatewayDisconnect {

    @WebSocketServer() server: Server;
    socketUsers = new Map<string, Socket>();

    constructor(
        private readonly _JwtService: JwtService,
        private readonly _ConfigService: ConfigService,
        private readonly _UserRepository: UserRepository,
        private readonly _TokenRepository: TokenRepository
    ) {}

    async handleConnection(client: Socket) {
        const authHeader = client.handshake.auth?.authorization
        console.log({authHeader})
        if (!authHeader || !authHeader.startsWith('Bearer')) throw new Error("Invalid token")

        const token = authHeader.split(" ")[1]

        try {
            const payload = this._JwtService.verify(token, {
                secret: this._ConfigService.get('JWT_SECRET')
            })

            const user = await this._UserRepository.findOne({
                filter: {_id: payload.id},
            })

            if (!user) throw new NotFoundException("User not found!")

            const tokenDoc = await this._TokenRepository.findOne({
                filter: {token, isValid: true, user: user._id}
            })

            if (!tokenDoc) throw new UnauthorizedException('Invalid token!');

            client.data.user = user;
        } catch(error) {
            throw new UnauthorizedException();
        }
        
        const userId = client.data.user.id;

        this.socketUsers.set(userId, client)
    }

    handleDisconnect(client: any) {
        this.socketUsers.delete(client.data.user.id);
        console.log("Client disconnected: ", client.data.user.id)
    }


    broadcastStockUpdate(productId: Types.ObjectId, newStock: number) {
        this.server.emit('stock-update', {productId, stock: newStock})
    }


    @SubscribeMessage('get-data')
    handleGetData() {
        console.log('Received event get-data')
    }


    @SubscribeMessage('private')
    privateMsg(client: Socket, data: {receiverId: string; message: string}) {
        const sender = client.data.user
        if(!sender)
            return client.emit("error", {message: "Sender not authenticated!"})

        const receiverSocket = this.socketUsers.get(data.receiverId);

        if (!receiverSocket)
            return client.emit("error", {message: "Sender not authenticated!"})

        receiverSocket.emit('private', {
            message: data.message, 
            from: {id: sender._id, name: sender.name}})
    }
}