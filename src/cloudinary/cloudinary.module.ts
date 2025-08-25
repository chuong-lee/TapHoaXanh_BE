import { forwardRef, Module } from '@nestjs/common';
import { CloudinaryService } from './implement/cloudinary.service';
import { CloudinaryController } from './cloudinary.controller';
import { CloudinaryRepository } from './implement/cloudinary.repository';
import { CloudinaryServiceProvider, CloudinaryRepositoryProvider } from './cloudinary.provider';
import { AuthModule } from '../auth/auth.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule, forwardRef(() => AuthModule)],
  controllers: [CloudinaryController],
  providers: [CloudinaryServiceProvider, CloudinaryRepositoryProvider, CloudinaryService, CloudinaryRepository],
  exports: [CloudinaryServiceProvider, CloudinaryService],
})
export class CloudinaryModule {}
