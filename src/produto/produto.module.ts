import { Module } from '@nestjs/common';
import { ProdutoController } from './produto.controller';
import { ProdutoService } from './produto.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [ProdutoController],
  providers: [ProdutoService, PrismaService],
  exports: [PrismaService],
})
export class ProdutoModule {}
