import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { WebSocketController } from './web-socket.controller';
import { WebSocketService } from './web-socket.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [WebSocketController],
  providers: [WebSocketService],
})
export class WebSocketModule {}
