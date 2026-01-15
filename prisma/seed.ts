import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando o Seed de Estoque...');

  const produtos = [
    {
      id: 'SSD-3TB',
      nome: 'SSD 3TB Alta Performance',
      quantidade: 50,
    },
    {
      id: 'MEM-32GB',
      nome: 'Memória RAM 32GB DDR5',
      quantidade: 20,
    },
    {
      id: 'GPU-RTX4090',
      nome: 'Placa de Vídeo RTX 4090',
      quantidade: 5,
    }
  ];

  for (const produto of produtos) {
    await prisma.produto.upsert({
      where: { id: produto.id },
      update: { 
        quantidade: produto.quantidade, // Reseta o estoque ao rodar o seed
        nome: produto.nome 
      },
      create: produto,
    });
  }

  console.log('✅ Seed finalizado: Produtos criados ou atualizados!');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao rodar o Seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });