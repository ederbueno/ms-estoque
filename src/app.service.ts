import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { PrismaService } from './prisma.service';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    await this.kafkaClient.connect();
    console.log('📡 Estoque conectado ao Kafka!');
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

      this.kafkaClient.emit('estoque_confirmado', {
        vendaId,
        clienteId,
        cep,
        itens,
        status: 'RESERVADO'
      });
      console.log(`✅ Sucesso: Venda [${vendaId}] reservada e enviada para Logística.`);

    } catch (err) {
      // --- TRATAMENTO DE ERRO E SAGA DE CANCELAMENTO ---
      console.error(`❌ Falha no Estoque para Venda [${vendaId}]: ${err.message}`);
      this.kafkaClient.emit('venda_cancelada', {
        vendaId: vendaId || 'N/A',
        motivo: err.message,
      });
    }
  }

async estornarEstoque(data: any) {
  // Ajustado para aceitar tanto 'produtos' quanto 'itens' (compatibilidade)
  const itensParaEstornar = data.produtos || data.itens;
  const { vendaId } = data;

  console.log(
    `🔙 SAGA REVERSA: Devolvendo itens da Venda [${vendaId}]`,
  );

  try {
    await this.prisma.$transaction(async (tx) => {
      for (const item of itensParaEstornar) {
        await tx.produto.update({
          where: { id: item.produtoId },
          data: {
            // Se o seu campo no banco for 'quantidade', mantemos assim. 
            // Se for 'estoque', mude o nome abaixo:
            quantidade: { increment: item.quantidade },
            updatedAt: new Date(),
          },
        });
        console.log(
          `🔄 Item ${item.produtoId} devolvido ao estoque.`,
        );
      }
    });
    console.log(`✅ Estorno concluído para Venda [${vendaId}].`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    console.error(
      `❌ Erro crítico no estorno da Venda [${vendaId}]: ${msg}`,
    );
  }
}
}