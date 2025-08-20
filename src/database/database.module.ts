import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProd = process.env.NODE_ENV === 'production';
        console.log('🚀 Database running in:', isProd ? 'PRODUCTION' : 'LOCAL');
        return {
          type: 'mysql',
          host: isProd ? undefined : config.getOrThrow('MYSQL_HOST'),
          port: isProd ? undefined : config.getOrThrow('MYSQL_PORT'),
          username: isProd ? undefined : config.getOrThrow('MYSQL_USERNAME'),
          password: isProd ? undefined : config.getOrThrow('MYSQL_PASSWORD'),
          database: isProd ? undefined : config.getOrThrow('MYSQL_DATABASE'),
          url: isProd ? process.env.DATABASE_URL : undefined, // dùng URL khi prod
          autoLoadEntities: true,
          synchronize: !isProd, // chỉ bật sync ở local
          ssl: isProd ? { rejectUnauthorized: false } : undefined,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
