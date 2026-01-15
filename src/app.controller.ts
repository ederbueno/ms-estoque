import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices'; // Importe EventPattern aqui
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

@EventPattern('venda_realizada')
async handleVenda(@Payload() data: any) {
  const payload = data.value || data;
  await this.appService.baixarEstoque(payload);
}

@EventPattern('logistica_falhou')
async handleLogisticaFalhou(@Payload() data: any) {
  console.log(`🔙 Recebido alerta de falha na logística para Venda: ${data.vendaId}`);
  await this.appService.estornarEstoque(data);
}

@EventPattern('venda_cancelada_estorno')
async handleEstornoEstoque(@Payload() data: any) {
  console.log(`♻️ Recebido pedido de estorno para a venda: ${data.vendaId}`);
  await this.appService.estornarEstoque(data);
}

}