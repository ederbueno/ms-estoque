import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { Partitioners } from 'kafkajs';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: [process.env.KAFKA_BROKER || 'localhost:9094'],
      },
      producer: {
        createPartitioner: Partitioners.LegacyPartitioner,
      },
      consumer: {
        groupId: 'estoque-consumer', 
      },
    },
    // Injetando o Winston aqui:
    logger: WinstonModule.createLogger({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp({ format: 'DD/MM/YYYY HH:mm:ss' }),
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, context }) => {
              return `[${timestamp}] ${level}: [${context || 'Estoque'}] ${message}`;
            }),
          ),
        }),
        new winston.transports.File({ filename: 'logs/estoque-error.log', level: 'error' }),
      ],
    }),
  });
  
  await app.listen();
  
  // Usando o Logger do Nest (que agora aponta para o Winston) para a mensagem inicial
  const logger = new (require('@nestjs/common').Logger)('Bootstrap');
  logger.log('📦 MS ESTOQUE RODANDO APENAS COMO CONSUMIDOR KAFKA');
}
bootstrap();