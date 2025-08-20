import { Test, TestingModule } from '@nestjs/testing';
import { NewsService } from './news.service';
import { NewsRepository } from './news.repository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { News } from './entities/news.entity';
import { NotFoundException } from '@nestjs/common';

describe('NewsService', () => {
  let service: NewsService;
  let repository: NewsRepository;

  const mockRepository = {
    findAllWithRelations: jest.fn(),
    findOneWithRelations: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    incrementViews: jest.fn(),
    incrementLikes: jest.fn(),
    decrementLikes: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NewsService,
        NewsRepository,
        {
          provide: getRepositoryToken(News),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<NewsService>(NewsService);
    repository = module.get<NewsRepository>(NewsRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have repository', () => {
    expect(repository).toBeDefined();
  });

  describe('findOne', () => {
    it('should throw NotFoundException when news not found', async () => {
      jest.spyOn(repository, 'findOneWithRelations').mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });
});
