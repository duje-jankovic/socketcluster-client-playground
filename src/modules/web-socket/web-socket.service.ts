import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AGClientSocket, create as createSocketClient } from 'socketcluster-client';
import { WebsocketChairfillEventTypeEnum } from './enums/websocket-chairfill-event-type.enum';

export const CHAIRFILL_FILTER_CHANNEL = 'chairfill_filter_id';

@Injectable()
export class WebSocketService {
  token: string;
  socket: AGClientSocket;

  constructor(private readonly configService: ConfigService, private readonly jwtService: JwtService) {
    this.token = this.jwtService.sign({
      shared_secret: this.configService.get<string>('SOCKET_SERVER_SHARED_SECRET'),
    });
    this.socket = createSocketClient({
      hostname: this.configService.get<string>('SOCKET_SERVER_HOST'),
      secure: this.configService.get<boolean>('SOCKET_SERVER_SECURE_HOST', false),
      autoConnect: false,
      autoReconnect: true,
      autoReconnectOptions: {
        initialDelay: 3000, // milliseconds
        randomness: 1000, // milliseconds
        multiplier: 1.5, // decimal
        maxDelay: 10000, // milliseconds
      },
    });
    this.onConnect();
    this.onConnectAbort();
    this.onAuthenticate();
    this.onError();
    this.onDisconnect();
    this.onKickOut();
    this.socket.connect();
  }

  async sendTreatmentPlanCandidatesList(chairfillFilterId: string, data = {}) {
    return this.send(
      `${CHAIRFILL_FILTER_CHANNEL}-${chairfillFilterId}`,
      WebsocketChairfillEventTypeEnum.TREATMENT_PLAN_PATIENT_CANDIDATES_LIST,
      { data },
    );
  }

  private async send(
    channel: string,
    type: WebsocketChairfillEventTypeEnum,
    options: { data?: Record<string, any> } = {},
  ) {
    try {
      this.socket.transmitPublish(channel, { type, data: options.data });
      console.log(`Sent ${type}::${JSON.stringify(options.data)} to '${channel}'`);
    } catch (error) {
      console.error(error);
    }
  }

  private async onConnect() {
    for await (const event of this.socket.listener('connect')) {
      console.log(`WebSocket client ${event.id} is connected.`);
      try {
        if (this.socket.authState === this.socket.UNAUTHENTICATED) {
          await this.socket.authenticate(this.token);
        }
      } catch (error) {
        console.error(error);
      }
    }
  }

  private async onAuthenticate() {
    // eslint-disable-next-line
    for await (const event of this.socket.listener('authenticate')) {
      console.log(`WebSocket connection is authenticated.`);
    }
  }

  private async onError() {
    for await (const event of this.socket.listener('error')) {
      console.error(event.error.message);
    }
  }

  private async onDisconnect() {
    for await (const { code, reason } of this.socket.listener('disconnect')) {
      console.log(`Socket is disconnected with code ${code} and reason ${reason}.`);
    }
  }

  private async onConnectAbort() {
    for await (const { code, reason } of this.socket.listener('connectAbort')) {
      console.log(`Socket connection is aborted with code ${code} and reason ${reason}.`);
    }
  }

  private async onKickOut() {
    for await (const { channel, message } of this.socket.listener('kickOut')) {
      console.log(`Websocket client is was kicked-out from the channel ${channel} with message ${message}.`);
    }
  }
}
