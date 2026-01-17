import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Produto } from '@prisma/client';

@Injectable()
export class ProdutoService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Produto[]> {
    try {
      console.log('Tentando buscar todos os produtos do banco de dados.');
      const produtos = await this.prisma.produto.findMany();
      console.log('Produtos buscados com sucesso.');
      return produtos;
    } catch (error) {
      console.error(
        '!!! ERRO CRÍTICO AO BUSCAR PRODUTOS !!!',
        error,
      );
      throw error; // Lança o erro novamente para garantir que a requisição ainda falhe, mas agora com log
    }
  }
}
