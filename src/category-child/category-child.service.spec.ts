import { Test, TestingModule } from '@nestjs/testing';
import { CategoryChildService } from './category-child.service';

describe('CategoryChildService', () => {
  let service: CategoryChildService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoryChildService],
    }).compile();

    service = module.get<CategoryChildService>(CategoryChildService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
