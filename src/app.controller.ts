import { Controller, Get } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  health() {
    return { status: 'ok', service: 'ms-estoque' };
  }

  @MessagePattern('venda_criada')
  async handleVendaCriada(@Payload() message: any) {
    const data = message?.value ?? message;
    return this.appService.baixarEstoque(data);
  }

  @MessagePattern('venda_cancelada')
  async handleVendaCancelada(@Payload() message: any) {
    const data = message?.value ?? message;
    return this.appService.estornarEstoque(data);
  }
}
