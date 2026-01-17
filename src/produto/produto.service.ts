import { Injectable, NotFoundException } from '@nestjs/common';
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
      console.error('!!! ERRO CRÍTICO AO BUSCAR PRODUTOS !!!', error);
      throw error;
    }
  }

  async findOne(id: string): Promise<Produto | null> {
    const produto = await this.prisma.produto.findUnique({
      where: { id },
    });
    if (!produto) {
      throw new NotFoundException(`Produto com ID ${id} não encontrado`);
    }
    return produto;
  }

  async create(data: { nome: string; quantidade: number; codigo?: string; categoria?: string; preco?: number }): Promise<Produto> {
    return this.prisma.produto.create({
      data: {
        nome: data.nome,
        quantidade: data.quantidade,
      },
    });
  }

  async update(id: string, data: { nome?: string; quantidade?: number; codigo?: string; categoria?: string; preco?: number }): Promise<Produto> {
    const produto = await this.prisma.produto.findUnique({
      where: { id },
    });
    if (!produto) {
      throw new NotFoundException(`Produto com ID ${id} não encontrado`);
    }
    return this.prisma.produto.update({
      where: { id },
      data: {
        nome: data.nome,
        quantidade: data.quantidade,
      },
    });
  }

  async delete(id: string): Promise<void> {
    const produto = await this.prisma.produto.findUnique({
      where: { id },
    });
    if (!produto) {
      throw new NotFoundException(`Produto com ID ${id} não encontrado`);
    }
    await this.prisma.produto.delete({
      where: { id },
    });
  }
}
