import { Test, TestingModule } from '@nestjs/testing';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';
import { NewsRepository } from './news.repository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { News } from './entities/news.entity';

describe('NewsController', () => {
  let controller: NewsController;
  let service: NewsService;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NewsController],
      providers: [
        NewsService,
        NewsRepository,
        {
          provide: getRepositoryToken(News),
          useValue: mockRepository,
        },
      ],
    }).compile();

    controller = module.get<NewsController>(NewsController);
    service = module.get<NewsService>(NewsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should have news service', () => {
    expect(service).toBeDefined();
  });
});
