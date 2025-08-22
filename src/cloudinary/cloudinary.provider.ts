import { Provider } from '@nestjs/common';
import { ICloudinaryService } from './interfaces/icloudinary-service.interface';
import { CloudinaryService } from './implement/cloudinary.service';
import { CloudinaryRepository } from './implement/cloudinary.repository';
import { ICloudinaryRepository } from './interfaces/icloudinary-repository.interface';

export const CloudinaryServiceProvider: Provider = {
  provide: ICloudinaryService,
  useClass: CloudinaryService,
};

export const CloudinaryRepositoryProvider: Provider = {
  provide: ICloudinaryRepository,
  useClass: CloudinaryRepository,
};
