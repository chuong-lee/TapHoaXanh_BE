import { Test, TestingModule } from '@nestjs/testing';
import { CategoryChildController } from './category-child.controller';
import { CategoryChildService } from './category-child.service';

describe('CategoryChildController', () => {
  let controller: CategoryChildController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryChildController],
      providers: [CategoryChildService],
    }).compile();

    controller = module.get<CategoryChildController>(CategoryChildController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
