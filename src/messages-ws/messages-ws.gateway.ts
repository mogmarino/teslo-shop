import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dto/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/auth/interfaces';

@WebSocketGateway({cors: true})
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() wss: Server

  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService
  ) {}

  async handleConnection(client: Socket) {
    // console.log(`Cliente conectado: ${client.id}`);
    const token = client.handshake.headers.authentication as string
    let payload: JwtPayload
    try {
      payload = this.jwtService.verify(token)
      await this.messagesWsService.registerClient(client, payload.id)

    } catch (error) {
      client.disconnect()
      return
    }

    // console.log({payload});
    

    // conectarse a una sala especifica y emitir mensajes a la misma
    // client.join('ventas')
    // this.wss.to('ventas').emit('')

    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients())
    
  }
  
  handleDisconnect(client: Socket) {
    // console.log(`Cliente desconectado: ${client.id}`);
    this.messagesWsService.removeClient(client.id)
    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients())
  }

  @SubscribeMessage('message-from-client')
  handleMessageFromClient (client: Socket, payload: NewMessageDto) {
    // console.log(`client: ${client.id} - payload: ${payload.message}`);

    // emite unicamente al cliente
    // client.emit('message-from-server',{
    //   fullName: 'Bilbo Bolsonaro',
    //   message: payload.message
    // })

    // emite a todos menos al cliente inicial
    // client.broadcast.emit('message-from-server',{
    //   fullName: 'Bilbo Bolsonaro',
    //   message: payload.message
    // })

    // emitir a todos los clientes incluido el cliente inicial
    this.wss.emit('message-from-server',{
      fullName: this.messagesWsService.getUserFullName(client.id),
      message: payload.message
    })

    // emite a una sala especifica
    // this.wss.to()
    
  }
}
