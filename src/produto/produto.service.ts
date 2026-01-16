import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Produto } from '@prisma/client';

@Injectable()
export class ProdutoService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Produto[]> {
    return this.prisma.produto.findMany();
  }
}
