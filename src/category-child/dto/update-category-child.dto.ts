import { PartialType } from '@nestjs/swagger';
import { CreateCategoryChildDto } from './create-category-child.dto';

export class UpdateCategoryChildDto extends PartialType(CreateCategoryChildDto) {}
