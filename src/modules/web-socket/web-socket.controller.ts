import { Body, Controller, HttpCode, Param, Post } from '@nestjs/common';
import { WebSocketService } from './web-socket.service';

@Controller('web-socket')
export class WebSocketController {
  constructor(private webSocketService: WebSocketService) {}

  @Post('test-treatment-plan-candidates/:chairfillFilterId')
  @HttpCode(200)
  async test(
    @Body()
    data: Record<string, unknown>,
    @Param('chairfillFilterId') chairfillFilterId: string,
  ) {
    return this.webSocketService.sendTreatmentPlanCandidatesList(chairfillFilterId, data);
  }
}
