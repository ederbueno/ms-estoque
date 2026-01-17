import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { ProdutoService } from './produto.service';
import { Produto } from '@prisma/client';

@Controller('produtos')
export class ProdutoController {
  constructor(private readonly produtoService: ProdutoService) {}

  @Get()
  async findAll(): Promise<Produto[]> {
    return this.produtoService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Produto | null> {
    return this.produtoService.findOne(id);
  }

  @Post()
  async create(@Body() data: { nome: string; quantidade: number; codigo?: string; categoria?: string; preco?: number }): Promise<Produto> {
    return this.produtoService.create(data);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() data: { nome?: string; quantidade?: number; codigo?: string; categoria?: string; preco?: number }
  ): Promise<Produto> {
    return this.produtoService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.produtoService.delete(id);
  }
}
