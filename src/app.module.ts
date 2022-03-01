import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WebSocketModule } from './modules/web-socket/web-socket.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), WebSocketModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
