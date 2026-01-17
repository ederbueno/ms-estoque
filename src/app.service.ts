import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { PrismaService } from './prisma.service';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    await this.kafkaClient.connect();
  }

  private async emitEvento(topico: string, payload: any) {
    try {
      await firstValueFrom(this.kafkaClient.emit(topico, payload));
      console.log(`📨 Evento Kafka emitido: ${topico}`);
    } catch (error: unknown) {
      const mensagem = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error(`❌ Falha ao emitir evento Kafka (${topico}): ${mensagem}`);
    }
  }

  async baixarEstoque(data: any) {
    const { itens, clienteId, vendaId, cep } = data;

    try {
      await this.prisma.$transaction(async (tx) => {
        console.log(`🧐 Processando Venda [${vendaId}] para Cliente: ${clienteId}`);

        if (!itens || itens.length === 0) throw new Error('VENDA_SEM_ITENS');

        for (const item of itens) {
          const produto = await tx.produto.findUnique({ where: { id: item.produtoId } });

          if (!produto) throw new Error(`PRODUTO_NAO_ENCONTRADO: ${item.produtoId}`);
          if (produto.quantidade < item.quantidade) throw new Error(`ESTOQUE_INSUFICIENTE: ${item.produtoId}`);

          await tx.produto.update({
            where: { id: item.produtoId },
            data: { 
              quantidade: { decrement: item.quantidade },
              updatedAt: new Date()
            },
          });
          
          console.log(`📦 Baixado: ${item.produtoId} (-${item.quantidade})`);
        }
      });

      console.log(`✅ Sucesso: Venda [${vendaId}] reservada.`);

      await this.emitEvento('estoque_reservado', {
        vendaId,
        clienteId,
        itens,
      });

      return { success: true, vendaId };

    } catch (err: any) {
      console.error(`❌ Falha no Estoque para Venda [${vendaId}]: ${err.message}`);

      await this.emitEvento('estoque_falhou', {
        vendaId,
        clienteId,
        itens,
        motivo: err?.message || 'ERRO_ESTOQUE',
      });

      throw err;
    }
  }

  async estornarEstoque(data: any) {
    const itensParaEstornar = data.produtos || data.itens;
    const { vendaId } = data;

    console.log(`🔙 SAGA REVERSA: Devolvendo itens da Venda [${vendaId}]`);

    try {
      await this.prisma.$transaction(async (tx) => {
        for (const item of itensParaEstornar) {
          await tx.produto.update({
            where: { id: item.produtoId },
            data: {
              quantidade: { increment: item.quantidade },
              updatedAt: new Date(),
            },
          });
          console.log(`🔄 Item ${item.produtoId} devolvido ao estoque.`);
        }
      });
      console.log(`✅ Estorno concluído para Venda [${vendaId}].`);

      await this.emitEvento('estoque_estornado', {
        vendaId,
        itens: itensParaEstornar,
      });

      return { success: true, vendaId };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error(`❌ Erro crítico no estorno da Venda [${vendaId}]: ${msg}`);
      throw err;
    }
  }
}
