import { Provider } from '@nestjs/common';
import { IUsersRepository } from './interfaces/iusers-repository.interface';
import { UsersRepository } from './implements/users.repository';
import { IUsersService } from './interfaces/iusers-service.interface';
import { UsersService } from './implements/users.service';
import { ICloudinaryService } from '../cloudinary/interfaces/icloudinary-service.interface';

export const UsersRepositoryProvider: Provider = {
  provide: IUsersRepository,
  useClass: UsersRepository,
};

export const UsersServiceProvider: Provider = {
  provide: IUsersService,
  useFactory: (usersRepository: IUsersRepository, cloudinaryService: ICloudinaryService) => {
    return new UsersService(usersRepository, cloudinaryService);
  },
  inject: [IUsersRepository, ICloudinaryService],
};
