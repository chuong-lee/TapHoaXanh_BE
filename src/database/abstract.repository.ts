import { DeepPartial, FindOptionsWhere, ObjectLiteral, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

export abstract class BaseRepository<T extends ObjectLiteral> {
  constructor(private readonly repository: Repository<T>) {}

  async findAll() {
    return await this.repository.find();
  }

  async findById(id: number) {
    return await this.repository.findOne({ where: { id } as unknown as FindOptionsWhere<T> });
  }

  create(data: DeepPartial<T>) {
    return this.repository.create(data);
  }

  save(data: DeepPartial<T>): Promise<T> {
    return this.repository.save(data);
  }

  async delete(id: number) {
    return await this.repository.softDelete(id);
  }

  async update(id: number, data: QueryDeepPartialEntity<T>) {
    return this.repository.update(id, data);
  }
}
