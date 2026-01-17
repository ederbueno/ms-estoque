import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { Partitioners } from 'kafkajs';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  // Create the main HTTP application, passing the Winston logger configuration
  const app = await NestFactory.create(AppModule, {
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

  // Connect the Kafka microservice for hybrid functionality
  app.connectMicroservice<MicroserviceOptions>({
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
  });

  // Start all microservices
  await app.startAllMicroservices();

  // Start the HTTP server
  const port = process.env.PORT || 3003;
  await app.listen(port);
  
  // Use the application's logger
  const logger = new Logger('Bootstrap');
  logger.log(`🚀 MS ESTOQUE (HTTP Server) is running on port ${port}`);
  logger.log('📦 MS ESTOQUE is also connected to Kafka as a consumer');
}
bootstrap();
