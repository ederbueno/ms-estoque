export class VendaDto {
  clienteId: string;
  valorTotal: number;
  itens: {
    produtoId: string;
    quantidade: number;
    precoUnitario: number;
  }[];
}