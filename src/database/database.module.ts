import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('MYSQL_HOST', 'localhost'),
        port: configService.get('MYSQL_PORT', 3306),
        username: configService.get('MYSQL_USERNAME', 'root'),
        password: configService.get('MYSQL_PASSWORD', 'root'),
        database: configService.get('MYSQL_DATABASE', 'defaultdb'),
        autoLoadEntities: true,
        synchronize: true, // Bật synchronize để TypeORM tự tạo schema
        logging: false,
        // migrations: ['dist/src/migrations/*.js'],
        // migrationsRun: false,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
