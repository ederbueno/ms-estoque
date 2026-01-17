import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    console.log('Tentando conectar ao banco de dados...');
    for (let i = 0; i < 5; i++) {
      try {
        await this.$connect();
        console.log('Conexão com o banco de dados bem-sucedida!');
        return; // Sair do loop em caso de sucesso
      } catch (error) {
        console.error(
          `Falha na tentativa de conexão com o banco de dados ${i + 1}. Nova tentativa em 5 segundos...`,
        );
        // Não mostrar o erro completo para não poluir o log, a menos que seja a última tentativa
        if (i === 4) {
          console.error(error);
        }
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Espera 5 segundos
      }
    }
    throw new Error(
      'Não foi possível conectar ao banco de dados após várias tentativas.',
    );
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}