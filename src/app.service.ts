import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

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
      return { success: true, vendaId };

    } catch (err: any) {
      console.error(`❌ Falha no Estoque para Venda [${vendaId}]: ${err.message}`);
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
      return { success: true, vendaId };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error(`❌ Erro crítico no estorno da Venda [${vendaId}]: ${msg}`);
      throw err;
    }
  }
}
