import { Controller, Get } from '@nestjs/common';
import { ProdutoService } from './produto.service';
import { Produto } from '@prisma/client';

@Controller('produtos')
export class ProdutoController {
  constructor(private readonly produtoService: ProdutoService) {}

  @Get()
  async findAll(): Promise<Produto[]> {
    return this.produtoService.findAll();
  }
}
